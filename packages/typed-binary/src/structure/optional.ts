import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { type ExtractIn, type ExtractOut, MaxValue, type Schema } from './types.ts';

export interface Optional<TInner> extends Schema<
  ExtractIn<TInner> | undefined,
  ExtractOut<TInner> | undefined
> {}

class OptionalSchemaImpl<TInner> implements Optional<TInner> {
  declare readonly $in: ExtractIn<TInner> | undefined;
  declare readonly $out: ExtractOut<TInner> | undefined;
  readonly inner: TInner & Schema;

  constructor(inner: TInner) {
    this.inner = inner as TInner & Schema;
  }

  write(output: ISerialOutput, value: ExtractIn<TInner> | undefined): void {
    if (value !== undefined && value !== null) {
      output.writeBool(true);
      this.inner.write(output, value);
    } else {
      output.writeBool(false);
    }
  }

  read(input: ISerialInput): ExtractOut<TInner> | undefined {
    const valueExists = input.readBool();

    if (valueExists) {
      return this.inner.read(input);
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
    value: ExtractIn<TInner> | MaxValue | undefined,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    if (value !== undefined) {
      this.inner.measure(value, measurer);
    }

    return measurer.add(1);
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function optional<TSchema extends any>(innerType: TSchema): Optional<TSchema> {
  return new OptionalSchemaImpl(innerType);
}
