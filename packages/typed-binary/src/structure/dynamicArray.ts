import { InvalidSchemaShapeError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { SerialInput, SerialOutput } from '../io/types.ts';
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
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: number;
}

class DynamicArrayImpl<TElement> implements DynamicArray<TElement> {
  readonly elementType: Schema;

  constructor(elementType: Schema) {
    this.elementType = elementType;
  }

  write(output: SerialOutput, values: readonly ExtractIn<TElement>[]): void {
    output.writeUint32(values.length);

    for (const value of values) {
      this.elementType.write(output, value);
    }
  }

  read(input: SerialInput): ExtractOut<TElement>[] {
    const array: ExtractOut<TElement>[] = [];

    const len = input.readUint32();

    for (let i = 0; i < len; ++i) {
      array.push(this.elementType.read(input));
    }

    return array;
  }

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue).size`
   */
  get maxSize(): number {
    return this.measure(MaxValue).size;
  }

  measure(
    values: readonly ExtractIn<TElement>[] | typeof MaxValue,
    measurer: Measurer = new Measurer(),
  ): Measurer {
    if (values === MaxValue) {
      // arrays cannot be bound
      return measurer.unbounded;
    }

    // Length encoding
    measurer.add(4); // u32

    // Values encoding
    for (const value of values) {
      this.elementType.measure(value, measurer);
    }

    return measurer;
  }
}

/*@__NO_SIDE_EFFECTS__*/
export function dynamicArray<TSchema>(_elementSchema: TSchema): DynamicArray<TSchema> {
  const elementSchema = toSchema(_elementSchema);
  if (!elementSchema) {
    throw new InvalidSchemaShapeError(
      `bin.dynamicArray(...) expects a schema, got '${String(_elementSchema)}'`,
    );
  }
  return new DynamicArrayImpl<TSchema>(elementSchema);
}
