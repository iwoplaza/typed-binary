import { TypedBinaryError } from '../error';
import {
  Measurer,
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
} from '../io';
import { Parsed } from '../utilityTypes';
import {
  IRefResolver,
  MaxValue,
  Schema,
  AnySchema,
  UnwrapArray,
} from './types';

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

  resolve(ctx: IRefResolver): void {
    this.schemas = resolveArray(ctx, this._unstableSchemas);
  }

  write(output: ISerialOutput, values: Parsed<UnwrapArray<TSequence>>): void {
    if (values.length !== this.schemas.length) {
      throw new TypedBinaryError(
        `Expected tuple of length ${this.schemas.length}, got ${values.length}`,
      );
    }

    for (let i = 0; i < this.schemas.length; ++i) {
      this.schemas[i].write(output, values[i]);
    }
  }

  read(input: ISerialInput): Parsed<UnwrapArray<TSequence>> {
    const array = [] as Parsed<UnwrapArray<TSequence>>;

    for (let i = 0; i < this.schemas.length; ++i) {
      array.push(
        this.schemas[i].read(input) as Parsed<UnwrapArray<TSequence>>[number],
      );
    }

    return array;
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
