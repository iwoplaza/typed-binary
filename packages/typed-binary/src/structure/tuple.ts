import { ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { MaxValue, type Schema, ExtractInRecord, ExtractOutRecord } from './types.ts';

export interface Tuple<TSequence extends [Schema, ...Schema[]]> extends Schema<
  ExtractInRecord<Readonly<TSequence>>,
  ExtractOutRecord<TSequence>
> {
  readonly schemas: TSequence;

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: number;
}

class TupleSchema<TSequence extends [Schema, ...Schema[]]> implements Schema<
  ExtractInRecord<TSequence>,
  ExtractOutRecord<TSequence>
> {
  readonly schemas: TSequence;

  constructor(schemas: TSequence) {
    this.schemas = schemas;
  }

  write(output: ISerialOutput, values: ExtractInRecord<TSequence>): void {
    if (values.length !== this.schemas.length) {
      throw new ValidationError(
        `Expected tuple of length ${this.schemas.length}, got ${values.length}`,
      );
    }

    for (let i = 0; i < this.schemas.length; ++i) {
      this.schemas[i].write(output, values[i]);
    }
  }

  read(input: ISerialInput): ExtractOutRecord<TSequence> {
    return this.schemas.map((schema) =>
      schema.read(input),
    ) as unknown as ExtractOutRecord<TSequence>;
  }

  get maxSize(): number {
    return this.measure(MaxValue).size;
  }

  measure(
    values: ExtractInRecord<TSequence> | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    for (let i = 0; i < this.schemas.length; ++i) {
      this.schemas[i].measure(values === MaxValue ? MaxValue : values[i], measurer);
    }

    return measurer;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function tuple<TSchema extends [Schema, ...Schema[]]>(schemas: TSchema): Tuple<TSchema> {
  return new TupleSchema(schemas);
}
