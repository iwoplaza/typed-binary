import { ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import type { Parsed } from '../utilityTypes.ts';
import {
  type AnySchema,
  type IRefResolver,
  MaxValue,
  Schema,
  type UnwrapArray,
} from './types.ts';

export function resolveArray<T extends AnySchema[]>(
  ctx: IRefResolver,
  refs: T,
): T {
  return refs.map((ref) => ctx.resolve(ref)) as T;
}

export class TupleSchema<
  TSequence extends [AnySchema, ...AnySchema[]],
> extends Schema<UnwrapArray<TSequence>> {
  private schemas: TSequence;

  constructor(private readonly _unstableSchemas: TSequence) {
    super();

    // In case this tuple isn't part of a keyed chain,
    // let's assume the inner type is stable.
    this.schemas = _unstableSchemas;
  }

  override resolveReferences(ctx: IRefResolver): void {
    this.schemas = resolveArray(ctx, this._unstableSchemas);
  }

  override write(
    output: ISerialOutput,
    values: Parsed<UnwrapArray<TSequence>>,
  ): void {
    if (values.length !== this.schemas.length) {
      throw new ValidationError(
        `Expected tuple of length ${this.schemas.length}, got ${values.length}`,
      );
    }

    for (let i = 0; i < this.schemas.length; ++i) {
      this.schemas[i].write(output, values[i]);
    }
  }

  override read(input: ISerialInput): Parsed<UnwrapArray<TSequence>> {
    const array = [] as Parsed<UnwrapArray<TSequence>>;

    for (let i = 0; i < this.schemas.length; ++i) {
      array.push(
        this.schemas[i].read(input) as Parsed<UnwrapArray<TSequence>>[number],
      );
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

  measure(
    values: Parsed<UnwrapArray<TSequence>> | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    for (let i = 0; i < this.schemas.length; ++i) {
      this.schemas[i].measure(
        values === MaxValue ? MaxValue : values[i],
        measurer,
      );
    }

    return measurer;
  }
}

export function tupleOf<TSchema extends [AnySchema, ...AnySchema[]]>(
  schemas: TSchema,
) {
  return new TupleSchema(schemas);
}
