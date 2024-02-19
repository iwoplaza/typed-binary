import {
  Measurer,
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
} from '../io';
import { Parsed } from '../utilityTypes';
import { IRefResolver, MaxValue, Schema, AnySchema } from './types';

export class OptionalSchema<TUnwrap extends AnySchema> extends Schema<
  TUnwrap | undefined
> {
  private innerSchema: TUnwrap;

  constructor(private readonly _innerUnstableSchema: TUnwrap) {
    super();

    // In case this optional isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.innerSchema = _innerUnstableSchema;
  }

  resolve(ctx: IRefResolver): void {
    this.innerSchema = ctx.resolve(this._innerUnstableSchema);
  }

  write(output: ISerialOutput, value: Parsed<TUnwrap> | undefined): void {
    if (value !== undefined && value !== null) {
      output.writeBool(true);
      this.innerSchema.write(output, value);
    } else {
      output.writeBool(false);
    }
  }

  read(input: ISerialInput): Parsed<TUnwrap> | undefined {
    const valueExists = input.readBool();

    if (valueExists) {
      return this.innerSchema.read(input) as Parsed<TUnwrap>;
    }

    return undefined;
  }

  measure(
    value: Parsed<TUnwrap> | MaxValue | undefined,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    if (value !== undefined) {
      this.innerSchema.measure(value, measurer);
    }

    return measurer.add(1);
  }
}
