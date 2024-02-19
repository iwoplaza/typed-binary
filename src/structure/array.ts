import {
  type ISerialInput,
  type ISerialOutput,
  type IMeasurer,
  Measurer,
} from '../io';
import { Parsed } from '../utilityTypes';
import { u32 } from './baseTypes';
import {
  IRefResolver,
  Schema,
  MaxValue,
  AnySchema,
  PropertyDescription,
} from './types';

export class ArraySchema<TUnwrap extends AnySchema> extends Schema<TUnwrap[]> {
  public elementType: TUnwrap;

  constructor(private readonly _unstableElementType: TUnwrap) {
    super();

    // In case this array isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.elementType = _unstableElementType;
  }

  resolve(ctx: IRefResolver): void {
    this.elementType = ctx.resolve(this._unstableElementType);
  }

  write(output: ISerialOutput, values: Parsed<TUnwrap>[]): void {
    output.writeUint32(values.length);

    for (const value of values) {
      this.elementType.write(output, value);
    }
  }

  read(input: ISerialInput): Parsed<TUnwrap>[] {
    const array: Parsed<TUnwrap>[] = [];

    const len = input.readUint32();

    for (let i = 0; i < len; ++i) {
      array.push(this.elementType.read(input) as Parsed<TUnwrap>);
    }

    return array;
  }

  measure(
    values: Parsed<TUnwrap>[] | typeof MaxValue,
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

  seekProperty(
    reference: Parsed<TUnwrap>[] | MaxValue,
    prop: number,
  ): PropertyDescription | null {
    if (typeof prop === 'symbol') {
      return null;
    }

    const indexProp = Number.parseInt(String(prop), 10);
    if (Number.isNaN(indexProp)) {
      return null;
    }

    if (reference === MaxValue) {
      return {
        bufferOffset: this.elementType.measure(MaxValue).size * indexProp,
        schema: this.elementType,
      };
    }

    if (indexProp >= reference.length) {
      // index out of range
      return null;
    }

    const measurer = new Measurer();
    for (let i = 0; i < indexProp; ++i) {
      this.elementType.measure(reference[i], measurer);
    }

    return {
      bufferOffset: measurer.size,
      schema: this.elementType,
    };
  }
}
