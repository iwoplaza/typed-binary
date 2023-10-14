import { TypedBinaryError } from '../error';
import {
  IRefResolver,
  ISchema,
  IStableSchema,
  MaxValue,
  Schema,
} from './types';
import type { ISerialInput, ISerialOutput } from '../io';

export class TupleSchema<T> extends Schema<T[]> {
  private elementSchema: IStableSchema<T>;

  constructor(
    private readonly _unstableElementSchema: ISchema<T>,
    public readonly length: number,
  ) {
    super();

    // In case this array isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.elementSchema = _unstableElementSchema as IStableSchema<T>;
  }

  resolve(ctx: IRefResolver): void {
    this.elementSchema = ctx.resolve(this._unstableElementSchema);
  }

  write(output: ISerialOutput, values: T[]): void {
    if (values.length !== this.length) {
      throw new TypedBinaryError(
        `Expected tuple of length ${this.length}, got ${values.length}`,
      );
    }

    for (const value of values) {
      this.elementSchema.write(output, value);
    }
  }

  read(input: ISerialInput): T[] {
    const array = [];

    for (let i = 0; i < this.length; ++i) {
      array.push(this.elementSchema.read(input));
    }

    return array;
  }

  sizeOf(values: T[] | typeof MaxValue): number {
    if (values === MaxValue) {
      return this.length * this.elementSchema.sizeOf(MaxValue);
    }

    return values
      .map((v) => this.elementSchema.sizeOf(v))
      .reduce((a, b) => a + b);
  }
}
