import { InvalidSchemaShapeError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import {
  type ExtractIn,
  type ExtractOut,
  MaxValue,
  type Schema,
  toSchema,
  type UnwrapSchema,
} from './types.ts';

export interface Optional<TInner = Schema> extends Schema<
  ExtractIn<TInner> | undefined,
  ExtractOut<TInner> | undefined
> {
  readonly inner: UnwrapSchema<TInner>;
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

class OptionalImpl<TInner> implements Optional<TInner> {
  readonly inner: UnwrapSchema<TInner>;
  readonly #inner: Schema;

  constructor(inner: Schema) {
    this.inner = inner as UnwrapSchema<TInner>;
    this.#inner = inner;
  }

  write(cursor: ByteCursor, value: ExtractIn<TInner> | undefined): void {
    if (value !== undefined && value !== null) {
      cursor.view.setUint8(cursor.offset++, 1);
      this.#inner.write(cursor, value);
    } else {
      cursor.view.setUint8(cursor.offset++, 0);
    }
  }

  read(cursor: ByteCursor): ExtractOut<TInner> | undefined {
    const valueExists = cursor.view.getUint8(cursor.offset++) !== 0;

    if (valueExists) {
      return this.#inner.read(cursor);
    }

    return undefined;
  }

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue)`
   */
  get maxSize(): number {
    return this.measure(MaxValue);
  }

  measure(value: ExtractIn<TInner> | MaxValue | undefined): number {
    // The extra byte encodes whether the value is present
    return 1 + (value !== undefined ? this.#inner.measure(value) : 0);
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function optional<TSchema extends any>(_inner: TSchema): Optional<TSchema> {
  const inner = toSchema(_inner);
  if (!inner) {
    throw new InvalidSchemaShapeError(
      `bin.optional(...) expects a schema, got '${String(_inner)}'`,
    );
  }

  return new OptionalImpl<TSchema>(inner);
}
