import { InvalidSchemaShapeError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { MutableRecord, Prettify } from '../utilityTypes.ts';
import { measureMax } from './measureMax.ts';
import {
  type ExtractIn,
  type ExtractInRecord,
  type ExtractOutRecord,
  MaxValue,
  type Schema,
  toSchema,
  type WithSchema,
} from './types.ts';

type TIn<T extends Record<string, WithSchema>> = Readonly<ExtractInRecord<T>>;
type TOut<T extends Record<string, WithSchema>> = ExtractOutRecord<T>;

export interface Struct<
  out TProps extends Record<string, WithSchema> = Record<string, WithSchema>,
> extends Schema<TIn<TProps>, TOut<TProps>> {
  readonly properties: TProps;

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

class StructImpl<out TProps extends Record<string, WithSchema>> implements Struct<TProps> {
  readonly properties: TProps;
  #resolvedProperties: [string, Schema][] | undefined;

  constructor(properties: TProps) {
    this.properties = properties;
  }

  /**
   * Properties can be getters that reference schemas which are not yet initialized
   * when the struct is created, so they are resolved on first use instead.
   */
  get #properties(): [string, Schema][] {
    if (!this.#resolvedProperties) {
      this.#resolvedProperties = Object.entries(this.properties).map(([key, property]) => {
        const schema = toSchema(property);
        if (!schema) {
          throw new InvalidSchemaShapeError(
            `bin.struct(...) expects property '${key}' to be a schema, got '${String(property)}'`,
          );
        }
        return [key, schema];
      });
    }
    return this.#resolvedProperties;
  }

  write(output: ISerialOutput, value: TIn<TProps>): void {
    type Property = keyof TIn<TProps>;

    for (const [key, property] of this.#properties) {
      property.write(output, value[key as Property] as ExtractIn<TProps[keyof TProps]>);
    }
  }

  read(input: ISerialInput) {
    type Property = keyof TOut<TProps>;

    const result = {} as TOut<TProps>;
    for (const [key, property] of this.#properties) {
      result[key as Property] = property.read(input) as TOut<TProps>[Property];
    }

    return result;
  }

  get maxSize(): number {
    return this.measure(MaxValue).size;
  }

  measure(value: TIn<TProps> | typeof MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    if (value === MaxValue) {
      // Properties can be getters that reference this schema recursively
      return measureMax(this, measurer, () => this.#measureProperties(value, measurer));
    }
    return this.#measureProperties(value, measurer);
  }

  #measureProperties(value: TIn<TProps> | typeof MaxValue, measurer: IMeasurer): IMeasurer {
    type Property = keyof TIn<TProps>;

    for (const [key, property] of this.#properties) {
      property.measure(value === MaxValue ? MaxValue : value[key as Property], measurer);
    }

    return measurer;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function struct<P extends { readonly [key: string]: any }>(
  properties: P,
): Struct<Prettify<MutableRecord<P>>> {
  return new StructImpl(properties);
}
