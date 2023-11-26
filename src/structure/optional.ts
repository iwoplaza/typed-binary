import {
  Measurer,
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
} from '../io';
import {
  IRefResolver,
  ISchema,
  IStableSchema,
  MaxValue,
  Schema,
} from './types';

export class OptionalSchema<T> extends Schema<T | undefined> {
  private innerSchema: IStableSchema<T>;

  constructor(private readonly _innerUnstableSchema: ISchema<T>) {
    super();

    // In case this optional isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.innerSchema = _innerUnstableSchema as IStableSchema<T>;
  }

  resolve(ctx: IRefResolver): void {
    this.innerSchema = ctx.resolve(this._innerUnstableSchema);
  }

  write(output: ISerialOutput, value: T | undefined): void {
    if (value !== undefined && value !== null) {
      output.writeBool(true);
      this.innerSchema.write(output, value);
    } else {
      output.writeBool(false);
    }
  }

  read(input: ISerialInput): T | undefined {
    const valueExists = input.readBool();

    if (valueExists) {
      return this.innerSchema.read(input);
    }

    return undefined;
  }

  measure(
    value: T | typeof MaxValue | undefined,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    if (value !== undefined) {
      this.innerSchema.measure(value, measurer);
    }

    return measurer.add(1);
  }
}
