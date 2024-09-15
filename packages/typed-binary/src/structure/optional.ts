import {
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
  Measurer,
} from '../io';
import type { ParseUnwrapped } from '../utilityTypes';
import {
  type AnySchema,
  type IRefResolver,
  MaxValue,
  Schema,
  type Unwrap,
} from './types';

export class OptionalSchema<TInner extends AnySchema> extends Schema<
  Unwrap<TInner> | undefined
> {
  private innerSchema: TInner;

  constructor(private readonly _innerUnstableSchema: TInner) {
    super();

    // In case this optional isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.innerSchema = _innerUnstableSchema;
  }

  resolveReferences(ctx: IRefResolver): void {
    this.innerSchema = ctx.resolve(this._innerUnstableSchema);
  }

  write(
    output: ISerialOutput,
    value: ParseUnwrapped<TInner> | undefined,
  ): void {
    if (value !== undefined && value !== null) {
      output.writeBool(true);
      this.innerSchema.write(output, value);
    } else {
      output.writeBool(false);
    }
  }

  read(input: ISerialInput): ParseUnwrapped<TInner> | undefined {
    const valueExists = input.readBool();

    if (valueExists) {
      return this.innerSchema.read(input) as ParseUnwrapped<TInner>;
    }

    return undefined;
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
    value: ParseUnwrapped<TInner> | MaxValue | undefined,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    if (value !== undefined) {
      this.innerSchema.measure(value, measurer);
    }

    return measurer.add(1);
  }
}
