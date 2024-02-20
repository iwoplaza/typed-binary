import { TypedBinaryError } from '../error';
import {
  Measurer,
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
} from '../io';
import { ParseUnwrapped } from '../utilityTypes';
import { IRefResolver, MaxValue, Schema, AnySchema, Unwrap } from './types';

export class ArraySchema<TElement extends AnySchema> extends Schema<
  Unwrap<TElement>[]
> {
  private elementSchema: TElement;

  constructor(
    private readonly _unstableElementSchema: TElement,
    public readonly length: number,
  ) {
    super();

    // In case this array isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.elementSchema = _unstableElementSchema;
  }

  resolve(ctx: IRefResolver): void {
    this.elementSchema = ctx.resolve(this._unstableElementSchema);
  }

  write(output: ISerialOutput, values: ParseUnwrapped<TElement>[]): void {
    if (values.length !== this.length) {
      throw new TypedBinaryError(
        `Expected array of length ${this.length}, got ${values.length}`,
      );
    }

    for (const value of values) {
      this.elementSchema.write(output, value);
    }
  }

  read(input: ISerialInput): ParseUnwrapped<TElement>[] {
    const array: ParseUnwrapped<TElement>[] = [];

    for (let i = 0; i < this.length; ++i) {
      array.push(this.elementSchema.read(input) as ParseUnwrapped<TElement>);
    }

    return array;
  }

  measure(
    values: ParseUnwrapped<TElement>[] | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    for (let i = 0; i < this.length; ++i) {
      this.elementSchema.measure(
        values === MaxValue ? MaxValue : values[i],
        measurer,
      );
    }

    return measurer;
  }
}
