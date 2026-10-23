import { hasProcess } from '../env.ts';
import { InvalidSchemaShapeError, ValidationError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import {
  type ExtractIn,
  type ExtractOut,
  MaxValue,
  type Schema,
  toSchema,
  type UnwrapSchema,
} from './types.ts';

export interface Array<TElement> extends Schema<
  readonly ExtractIn<TElement>[],
  ExtractOut<TElement>[]
> {
  readonly elementSchema: UnwrapSchema<TElement>;
  readonly length: number;
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue)`
   */
  readonly maxSize: number;
}

class ArrayImpl<TElement> implements Array<TElement> {
  readonly elementSchema: UnwrapSchema<TElement>;
  readonly length: number;
  readonly #element: Schema;

  constructor(elementSchema: Schema, length: number) {
    this.elementSchema = elementSchema as UnwrapSchema<TElement>;
    this.length = length;
    this.#element = elementSchema;
  }

  write(cursor: ByteCursor, values: readonly ExtractIn<TElement>[]): void {
    if (hasProcess && process.env.NODE_ENV !== 'production' && values.length !== this.length) {
      throw new ValidationError(`Expected array of length ${this.length}, got ${values.length}`);
    }

    for (const value of values) {
      this.#element.write(cursor, value);
    }
  }

  read(cursor: ByteCursor): ExtractOut<TElement>[] {
    const array: ExtractOut<TElement>[] = [];

    for (let i = 0; i < this.length; ++i) {
      array.push(this.#element.read(cursor));
    }

    return array;
  }

  /**
   * Returns the maximum number of bytes this schema can take up.
   *
   * Returns `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue)`
   */
  get maxSize(): number {
    return this.#element.measure(MaxValue) * this.length;
  }

  measure(values: readonly ExtractIn<TElement>[] | MaxValue): number {
    let size = 0;
    for (let i = 0; i < this.length; ++i) {
      size += this.#element.measure(values === MaxValue ? MaxValue : values[i]);
    }
    return size;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function array<TSchema>(_elementSchema: TSchema, length: number): Array<TSchema> {
  const elementSchema = toSchema(_elementSchema) as Schema;
  if (hasProcess && process.env.NODE_ENV !== 'production' && !elementSchema) {
    throw new InvalidSchemaShapeError(
      `bin.array(...) expects a schema, got '${String(_elementSchema)}'`,
    );
  }
  return new ArrayImpl<TSchema>(elementSchema, length);
}
