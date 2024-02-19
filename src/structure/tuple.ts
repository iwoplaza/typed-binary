import { TypedBinaryError } from '../error';
import { IRefResolver, MaxValue, Schema, AnySchema } from './types';
import {
  Measurer,
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
} from '../io';
import { Parsed } from '../utilityTypes';

export class TupleSchema<TUnwrap extends AnySchema> extends Schema<TUnwrap[]> {
  private elementSchema: TUnwrap;

  constructor(
    private readonly _unstableElementSchema: TUnwrap,
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

  write(output: ISerialOutput, values: Parsed<TUnwrap>[]): void {
    if (values.length !== this.length) {
      throw new TypedBinaryError(
        `Expected tuple of length ${this.length}, got ${values.length}`,
      );
    }

    for (const value of values) {
      this.elementSchema.write(output, value);
    }
  }

  read(input: ISerialInput): Parsed<TUnwrap>[] {
    const array: Parsed<TUnwrap>[] = [];

    for (let i = 0; i < this.length; ++i) {
      array.push(this.elementSchema.read(input) as Parsed<TUnwrap>);
    }

    return array;
  }

  measure(
    values: Parsed<TUnwrap>[] | MaxValue,
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
