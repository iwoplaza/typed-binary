import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { MutableRecord, Prettify } from '../utilityTypes.ts';
import {
  type ExtractIn,
  type ExtractInRecord,
  type ExtractOutRecord,
  MaxValue,
  type PropertyDescription,
  type Schema,
} from './types.ts';

/*#__NO_SIDE_EFFECTS__*/
export function exactEntries<T extends Record<keyof T, T[keyof T]>>(
  record: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(record) as [keyof T, T[keyof T]][];
}

type TIn<T extends Record<string, Schema>> = Readonly<ExtractInRecord<T>>;
type TOut<T extends Record<string, Schema>> = ExtractOutRecord<T>;

export interface Struct<in out TProps extends Record<string, Schema>> extends Schema<
  TIn<TProps>,
  TOut<TProps>
> {
  readonly properties: TProps;
}

class ObjectSchema<in out TProps extends Record<string, Schema>> implements Struct<TProps> {
  readonly properties: TProps;

  constructor(properties: TProps) {
    this.properties = properties;
  }

  write(output: ISerialOutput, value: TIn<TProps>): void {
    type Property = keyof TIn<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      property.write(output, value[key as Property] as ExtractIn<TProps[keyof TProps]>);
    }
  }

  read(input: ISerialInput) {
    type Property = keyof TOut<TProps>;

    const result = {} as TOut<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      result[key as Property] = property.read(input) as TOut<TProps>[Property];
    }

    return result;
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
    const measurer = new Measurer();

    for (const property of Object.values(this.properties)) {
      property.measure(MaxValue, measurer);
    }

    return measurer.size;
  }

  measure(value: TIn<TProps> | typeof MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    type Property = keyof TIn<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      property.measure(value === MaxValue ? MaxValue : value[key as Property], measurer);
    }

    return measurer;
  }

  seekProperty(
    reference: TIn<TProps> | MaxValue,
    prop: keyof TIn<TProps>,
  ): PropertyDescription | undefined {
    let bufferOffset = 0;

    for (const [key, property] of exactEntries(this.properties)) {
      if (key === prop) {
        return {
          bufferOffset,
          schema: property,
        };
      }

      bufferOffset += property.measure(reference).size;
    }

    return undefined;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function struct<P extends { readonly [key: string]: any }>(
  properties: P,
): Struct<Prettify<MutableRecord<P>>> {
  return new ObjectSchema(properties);
}
