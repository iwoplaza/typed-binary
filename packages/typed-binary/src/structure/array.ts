import { InvalidSchemaShapeError, ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { SerialInput, SerialOutput } from '../io/types.ts';
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
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: number;
}

class ArraySchema<TElement> implements Array<TElement> {
  readonly elementSchema: UnwrapSchema<TElement>;
  readonly length: number;
  readonly #element: Schema;

  constructor(elementSchema: Schema, length: number) {
    this.elementSchema = elementSchema as UnwrapSchema<TElement>;
    this.length = length;
    this.#element = elementSchema;
  }

  write(output: SerialOutput, values: readonly ExtractIn<TElement>[]): void {
    if (values.length !== this.length) {
      throw new ValidationError(`Expected array of length ${this.length}, got ${values.length}`);
    }

    for (const value of values) {
      this.#element.write(output, value);
    }
  }

  read(input: SerialInput): ExtractOut<TElement>[] {
    const array: ExtractOut<TElement>[] = [];

    for (let i = 0; i < this.length; ++i) {
      array.push(this.#element.read(input));
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
    return this.#element.measure(MaxValue).size * this.length;
  }

  measure(
    values: readonly ExtractIn<TElement>[] | MaxValue,
    measurer: Measurer = new Measurer(),
  ): Measurer {
    for (let i = 0; i < this.length; ++i) {
      this.#element.measure(values === MaxValue ? MaxValue : values[i], measurer);
    }

    return measurer;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function array<TSchema>(_elementSchema: TSchema, length: number): Array<TSchema> {
  const elementSchema = toSchema(_elementSchema);
  if (!elementSchema) {
    throw new InvalidSchemaShapeError(
      `bin.array(...) expects a schema, got '${String(_elementSchema)}'`,
    );
  }
  return new ArraySchema<TSchema>(elementSchema, length);
}
