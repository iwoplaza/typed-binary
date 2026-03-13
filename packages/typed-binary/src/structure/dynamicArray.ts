import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import {
  type ExtractIn,
  type ExtractOut,
  MaxValue,
  type PropertyDescription,
  type Schema,
} from './types.ts';

export interface DynamicArray<TElement extends Schema> extends Schema<
  readonly ExtractIn<TElement>[],
  ExtractOut<TElement>[]
> {}

class DynamicArraySchema<TElement extends Schema> implements DynamicArray<TElement> {
  readonly elementType: TElement;

  constructor(elementType: TElement) {
    this.elementType = elementType;
  }

  write(output: ISerialOutput, values: readonly ExtractIn<TElement>[]): void {
    output.writeUint32(values.length);

    for (const value of values) {
      this.elementType.write(output, value);
    }
  }

  read(input: ISerialInput): ExtractOut<TElement>[] {
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
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
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
export function dynamicArray<TSchema>(elementSchema: TSchema): DynamicArray<TSchema> {
  return new DynamicArraySchema(elementSchema);
}
