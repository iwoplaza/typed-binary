import { InvalidSchemaShapeError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import { measureMax } from './measureMax.ts';
import {
  type ExtractIn,
  type ExtractOut,
  MaxValue,
  type Schema,
  toSchema,
  type WithSchema,
} from './types.ts';

/**
 * Decides on the schema of the rest of the data, based on the value of the head.
 * Receives the value being written or measured (the whole input of the pipe), the value read
 * by the head when reading, or `MaxValue` when the pipe is being measured for its maximum size,
 * in which case it should return the biggest schema it can produce.
 */
export type PipeAction<THeadIn, THeadOut, TTail> = (value: THeadIn | THeadOut | MaxValue) => TTail;

export interface Pipe<THeadIn, THeadOut extends THeadIn, TTail> extends Schema<
  THeadIn & ExtractIn<TTail>,
  ExtractOut<TTail>
> {
  readonly head: Schema<THeadIn, THeadOut>;
  readonly action: PipeAction<THeadIn, THeadOut, TTail>;

  /**
   * An upper bound of the number of bytes this schema can take up.
   *
   * The max size of the head and the max size of the schema returned by the action
   * (given `MaxValue`) are measured independently, so the result can be bigger than any
   * value can actually take up, e.g. when the biggest head value doesn't lead to the biggest tail.
   * Use `bin.union` for tagged unions, which measures each variant exactly.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue)`
   */
  readonly maxSize: number;
}

class PipeImpl<THeadIn, THeadOut extends THeadIn, TTail> implements Pipe<THeadIn, THeadOut, TTail> {
  readonly head: Schema<THeadIn, THeadOut>;
  readonly action: PipeAction<THeadIn, THeadOut, TTail>;

  constructor(head: Schema<THeadIn, THeadOut>, action: PipeAction<THeadIn, THeadOut, TTail>) {
    this.head = head;
    this.action = action;
  }

  #tail(headValue: THeadIn | THeadOut | MaxValue): Schema {
    const tail = toSchema(this.action(headValue));
    if (!tail) {
      throw new InvalidSchemaShapeError(`bin.pipe(...) action has to return a schema`);
    }
    return tail;
  }

  write(cursor: ByteCursor, value: THeadIn & ExtractIn<TTail>): void {
    this.head.write(cursor, value);
    // The input value is passed in place of the head's output, which `pipe` guarantees
    // to be assignable to the head's input.
    this.#tail(value).write(cursor, value);
  }

  read(cursor: ByteCursor): ExtractOut<TTail> {
    const headValue = this.head.read(cursor);
    return this.#tail(headValue).read(cursor);
  }

  get maxSize(): number {
    return this.measure(MaxValue);
  }

  measure(value: (THeadIn & ExtractIn<TTail>) | MaxValue): number {
    if (value === MaxValue) {
      // The action can return schemas that reference this pipe recursively
      return measureMax(this, () => this.#measure(value));
    }
    return this.#measure(value);
  }

  #measure(value: (THeadIn & ExtractIn<TTail>) | MaxValue): number {
    // When measuring MaxValue, the head and the tail are measured independently of each other,
    // which can overestimate the max size (see `Pipe.maxSize`).
    return this.head.measure(value) + this.#tail(value).measure(value);
  }
}

/**
 * Reads/writes `head`, then passes its value to `action` to decide on the schema
 * of the rest of the data. The output of the pipe is the output of the returned schema,
 * so values of the head that should be part of the output have to be carried over,
 * e.g. with `bin.inherent(...)`.
 *
 * When writing or measuring, `action` receives the value being written instead of a value
 * read by the head, so the output of the head has to be assignable to its input (which holds
 * for all built-in schemas). Heads that transform values (e.g. `Schema<string, Version>`)
 * are rejected.
 */
/*#__NO_SIDE_EFFECTS__*/
export function pipe<THeadIn, THeadOut extends THeadIn, TTail>(
  _head: WithSchema<THeadIn, THeadOut>,
  action: PipeAction<THeadIn, THeadOut, TTail>,
): Pipe<THeadIn, THeadOut, TTail> {
  const head = toSchema(_head) as Schema<THeadIn, THeadOut> | undefined;
  if (!head) {
    throw new InvalidSchemaShapeError(`bin.pipe(...) expects a schema, got '${String(_head)}'`);
  }
  return new PipeImpl(head, action);
}
