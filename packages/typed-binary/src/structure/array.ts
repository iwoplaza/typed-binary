import { ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { type ExtractIn, type ExtractOut, MaxValue, type Schema } from './types.ts';

export interface Array<TElement> extends Schema<
  readonly ExtractIn<TElement>[],
  ExtractOut<TElement>[]
> {
  readonly elementSchema: TElement;
  readonly length: number;
}

class ArraySchema<TElement extends Schema> implements Array<TElement> {
  readonly elementSchema: TElement;
  readonly length: number;

  constructor(elementSchema: TElement, length: number) {
    this.elementSchema = elementSchema;
    this.length = length;
  }

  write(output: ISerialOutput, values: readonly ExtractIn<TElement>[]): void {
    if (values.length !== this.length) {
      throw new ValidationError(`Expected array of length ${this.length}, got ${values.length}`);
    }

    for (const value of values) {
      this.elementSchema.write(output, value);
    }
  }

  read(input: ISerialInput): ExtractOut<TElement>[] {
    const array: ExtractOut<TElement>[] = [];

    for (let i = 0; i < this.length; ++i) {
      array.push(this.elementSchema.read(input));
    }

    return array;
  }

  /**
   * Returns the maximum number of bytes this schema can take up.
   *
   * Returns `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue).size`
   */
  get maxSize(): number {
    return this.elementSchema.measure(MaxValue).size * this.length;
  }

  measure(
    values: readonly ExtractIn<TElement>[] | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    for (let i = 0; i < this.length; ++i) {
      this.elementSchema.measure(values === MaxValue ? MaxValue : values[i], measurer);
    }

    return measurer;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function array<TSchema extends Schema>(
  elementSchema: TSchema,
  length: number,
): ArraySchema<TSchema> {
  return new ArraySchema(elementSchema, length);
}
