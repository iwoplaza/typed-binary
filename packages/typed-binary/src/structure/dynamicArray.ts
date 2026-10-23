import { hasProcess } from '../env.ts';
import { InvalidSchemaShapeError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import { u32 } from './baseTypes.ts';
import { type ExtractIn, type ExtractOut, MaxValue, type Schema, toSchema } from './types.ts';

export interface DynamicArray<TElement> extends Schema<
  readonly ExtractIn<TElement>[],
  ExtractOut<TElement>[]
> {
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

class DynamicArrayImpl<TElement> implements DynamicArray<TElement> {
  readonly elementType: Schema;

  constructor(elementType: Schema) {
    this.elementType = elementType;
  }

  write(cursor: ByteCursor, values: readonly ExtractIn<TElement>[]): void {
    u32.write(cursor, values.length);

    for (const value of values) {
      this.elementType.write(cursor, value);
    }
  }

  read(cursor: ByteCursor): ExtractOut<TElement>[] {
    const array: ExtractOut<TElement>[] = [];

    const len = u32.read(cursor);

    for (let i = 0; i < len; ++i) {
      array.push(this.elementType.read(cursor));
    }

    return array;
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

  measure(values: readonly ExtractIn<TElement>[] | typeof MaxValue): number {
    if (values === MaxValue) {
      // arrays cannot be bound
      return Number.NaN;
    }

    // Length encoding (u32)
    let size = 4;

    // Values encoding
    for (const value of values) {
      size += this.elementType.measure(value);
    }

    return size;
  }
}

/*@__NO_SIDE_EFFECTS__*/
export function dynamicArray<TSchema>(_elementSchema: TSchema): DynamicArray<TSchema> {
  const elementSchema = toSchema(_elementSchema) as Schema;
  if (hasProcess && process.env.NODE_ENV !== 'production' && !elementSchema) {
    throw new InvalidSchemaShapeError(
      `bin.dynamicArray(...) expects a schema, got '${String(_elementSchema)}'`,
    );
  }
  return new DynamicArrayImpl<TSchema>(elementSchema);
}
