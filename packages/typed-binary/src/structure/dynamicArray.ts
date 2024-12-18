import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { Measurer } from '../io/measurer.ts';
import type { ParseUnwrapped } from '../utilityTypes.ts';
import {
  type AnySchema,
  type IRefResolver,
  MaxValue,
  type PropertyDescription,
  Schema,
  type Unwrap,
} from './types.ts';

export class DynamicArraySchema<TElement extends AnySchema> extends Schema<
  Unwrap<TElement>[]
> {
  public elementType: TElement;

  constructor(private readonly _unstableElementType: TElement) {
    super();

    // In case this array isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.elementType = _unstableElementType;
  }

  override resolveReferences(ctx: IRefResolver): void {
    this.elementType = ctx.resolve(this._unstableElementType);
  }

  override write(
    output: ISerialOutput,
    values: ParseUnwrapped<TElement>[],
  ): void {
    output.writeUint32(values.length);

    for (const value of values) {
      this.elementType.write(output, value);
    }
  }

  override read(input: ISerialInput): ParseUnwrapped<TElement>[] {
    const array: ParseUnwrapped<TElement>[] = [];

    const len = input.readUint32();

    for (let i = 0; i < len; ++i) {
      array.push(this.elementType.read(input) as ParseUnwrapped<TElement>);
    }

    return array;
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

  override measure(
    values: ParseUnwrapped<TElement>[] | typeof MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    if (values === MaxValue) {
      // arrays cannot be bound
      return measurer.unbounded;
    }

    // Length encoding
    measurer.add(4); // u32

    // Values encoding
    for (const value of values) {
      this.elementType.measure(value, measurer);
    }

    return measurer;
  }

  override seekProperty(
    reference: ParseUnwrapped<TElement>[] | MaxValue,
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

export const dynamicArrayOf = <TSchema extends AnySchema>(
  elementSchema: TSchema,
) => new DynamicArraySchema(elementSchema);
