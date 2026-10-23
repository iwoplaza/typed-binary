import { hasProcess } from '../env.ts';
import { InvalidSchemaShapeError, ValidationError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import {
  type ExtractInRecord,
  type ExtractOutRecord,
  MaxValue,
  type Schema,
  toSchema,
  type UnwrapSchema,
  type WithSchema,
} from './types.ts';

export interface Tuple<TSequence extends [WithSchema, ...WithSchema[]]> extends Schema<
  ExtractInRecord<Readonly<TSequence>>,
  ExtractOutRecord<TSequence>
> {
  readonly schemas: { [K in keyof TSequence]: UnwrapSchema<TSequence[K]> };

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue)`
   */
  readonly maxSize: number;
}

class TupleImpl<TSequence extends [WithSchema, ...WithSchema[]]> implements Tuple<TSequence> {
  readonly schemas: { [K in keyof TSequence]: UnwrapSchema<TSequence[K]> };
  readonly #schemas: Schema[];

  constructor(schemas: Schema[]) {
    this.schemas = schemas as unknown as { [K in keyof TSequence]: UnwrapSchema<TSequence[K]> };
    this.#schemas = schemas;
  }

  write(cursor: ByteCursor, values: ExtractInRecord<TSequence>): void {
    if (
      hasProcess &&
      process.env.NODE_ENV !== 'production' &&
      values.length !== this.#schemas.length
    ) {
      throw new ValidationError(
        `Expected tuple of length ${this.#schemas.length}, got ${values.length}`,
      );
    }

    for (let i = 0; i < this.#schemas.length; ++i) {
      this.#schemas[i].write(cursor, values[i]);
    }
  }

  read(cursor: ByteCursor): ExtractOutRecord<TSequence> {
    return this.#schemas.map((schema) =>
      schema.read(cursor),
    ) as unknown as ExtractOutRecord<TSequence>;
  }

  get maxSize(): number {
    return this.measure(MaxValue);
  }

  measure(values: ExtractInRecord<TSequence> | MaxValue): number {
    let size = 0;
    for (let i = 0; i < this.#schemas.length; ++i) {
      size += this.#schemas[i].measure(values === MaxValue ? MaxValue : values[i]);
    }
    return size;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function tuple<TSchema extends [WithSchema, ...WithSchema[]]>(
  schemas: TSchema,
): Tuple<TSchema> {
  return new TupleImpl<TSchema>(
    schemas.map((element, idx) => {
      const schema = toSchema(element) as Schema;
      if (hasProcess && process.env.NODE_ENV !== 'production' && !schema) {
        throw new InvalidSchemaShapeError(
          `bin.tuple(...) expects element ${idx} to be a schema, got '${String(element)}'`,
        );
      }
      return schema;
    }),
  );
}
