import {
  type ISerialInput,
  type ISerialOutput,
  type IMeasurer,
  Measurer,
} from '../io';
import { u32 } from './baseTypes';
import {
  IRefResolver,
  IUnstableSchema,
  ISchema,
  Schema,
  MaxValue,
} from './types';

export class ArraySchema<T> extends Schema<T[]> {
  public elementType: ISchema<T>;

  constructor(private readonly _unstableElementType: IUnstableSchema<T>) {
    super();

    // In case this array isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.elementType = _unstableElementType as ISchema<T>;
  }

  resolve(ctx: IRefResolver): void {
    this.elementType = ctx.resolve(this._unstableElementType);
  }

  write(output: ISerialOutput, values: T[]): void {
    output.writeUint32(values.length);

    for (const value of values) {
      this.elementType.write(output, value);
    }
  }

  read(input: ISerialInput): T[] {
    const array = [];

    const len = input.readUint32();

    for (let i = 0; i < len; ++i) {
      array.push(this.elementType.read(input));
    }

    return array;
  }

  measure(
    values: T[] | typeof MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    if (values === MaxValue) {
      // arrays cannot be bound
      return measurer.unbounded;
    }

    // Length encoding
    u32.measure(values.length, measurer);

    // Values encoding
    for (const value of values) {
      this.elementType.measure(value, measurer);
    }

    return measurer;
  }
}
