import type { ISerialInput, ISerialOutput } from '../io';
import { string } from './baseTypes';
import {
  Schema,
  IRefResolver,
  ISchemaWithProperties,
  SchemaMap,
  StableSchemaMap,
} from './types';
import { SubTypeKey } from './types';

export function exactEntries<T extends Record<keyof T, T[keyof T]>>(
  record: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(record) as [keyof T, T[keyof T]][];
}

export function resolveMap<
  T extends { [K in keyof T]: ISchemaWithProperties<Record<string, unknown>> },
>(ctx: IRefResolver, refs: T): StabilizedMap<T>;
export function resolveMap<T>(
  ctx: IRefResolver,
  refs: SchemaMap<T>,
): StableSchemaMap<T>;
export function resolveMap<T>(
  ctx: IRefResolver,
  refs: SchemaMap<T>,
): StableSchemaMap<T> {
  const props = {} as StableSchemaMap<T>;

  for (const [key, ref] of exactEntries(refs)) {
    props[key] = ctx.resolve(ref);
  }

  return props;
}

export type StableObjectSchemaMap<
  T extends Record<string, Record<string, unknown>>,
> = { [key in keyof T]: ObjectSchema<T[key]> };

export class ObjectSchema<T extends { [key: string]: unknown }>
  extends Schema<T>
  implements ISchemaWithProperties<T>
{
  public properties: StableSchemaMap<T>;

  constructor(private readonly _properties: SchemaMap<T>) {
    super();

    // In case this object isn't part of a keyed chain,
    // let's assume properties are stable.
    this.properties = _properties as StableSchemaMap<T>;
  }

  resolve(ctx: IRefResolver): void {
    this.properties = resolveMap(ctx, this._properties);
  }

  write<I extends T>(output: ISerialOutput, value: I): void {
    for (const [key, property] of exactEntries(this.properties)) {
      property.write(output, value[key]);
    }
  }

  read(input: ISerialInput): T {
    const result = {} as T;

    for (const [key, property] of exactEntries(this.properties)) {
      result[key] = property.read(input);
    }

    return result;
  }

  sizeOf<I extends T>(value: I): number {
    return exactEntries(this.properties)
      .map(([key, property]) => property.sizeOf(value[key])) // Mapping properties into their sizes.
      .reduce((a, b) => a + b, 0); // Summing them up
  }
}

export type AsSubTypes<T> = {
  [K in keyof T]: T[K] extends ISchemaWithProperties<infer P>
    ? P & { type: K }
    : never;
}[keyof T];
export type StabilizedMap<T> = {
  [K in keyof T]: T[K] extends ISchemaWithProperties<infer P>
    ? ObjectSchema<P>
    : never;
};

type GenericInfered<T, E> = T extends Record<string, never>
  ? AsSubTypes<E>
  : T & AsSubTypes<E>;

export class GenericObjectSchema<
  T extends Record<string, unknown>, // Base properties
  E extends {
    [key in keyof E]: ISchemaWithProperties<Record<string, unknown>>;
  }, // Sub type map
> extends Schema<GenericInfered<T, E>> {
  private _baseObject: ObjectSchema<T>;
  public subTypeMap: StabilizedMap<E>;

  constructor(
    public readonly keyedBy: SubTypeKey,
    properties: SchemaMap<T>,
    private readonly _subTypeMap: E,
  ) {
    super();

    this._baseObject = new ObjectSchema(properties);

    // In case this object isn't part of a keyed chain,
    // let's assume sub types are stable.
    this.subTypeMap = _subTypeMap as unknown as typeof this.subTypeMap;
  }

  resolve(ctx: IRefResolver): void {
    this._baseObject.resolve(ctx);
    this.subTypeMap = resolveMap(ctx, this._subTypeMap);
  }

  write(output: ISerialOutput, value: GenericInfered<T, E>): void {
    // Figuring out sub-types

    const subTypeDescription = this.subTypeMap[value.type] || null;
    if (subTypeDescription === null) {
      throw new Error(
        `Unknown sub-type '${value.type.toString()}' in among '${JSON.stringify(
          Object.keys(this.subTypeMap),
        )}'`,
      );
    }

    // Writing the sub-type out.
    if (this.keyedBy === SubTypeKey.ENUM) {
      output.writeByte(value.type as number);
    } else {
      output.writeString(value.type as string);
    }

    // Writing the base properties
    this._baseObject.write(output, value as T);

    // Extra sub-type fields
    for (const [key, extraProp] of exactEntries(
      subTypeDescription.properties,
    )) {
      extraProp.write(output, value[key]);
    }
  }

  read(input: ISerialInput): GenericInfered<T, E> {
    const subTypeKey =
      this.keyedBy === SubTypeKey.ENUM ? input.readByte() : input.readString();

    const subTypeDescription = this.subTypeMap[subTypeKey as keyof E] || null;
    if (subTypeDescription === null) {
      throw new Error(
        `Unknown sub-type '${subTypeKey}' in among '${JSON.stringify(
          Object.keys(this.subTypeMap),
        )}'`,
      );
    }

    const result = this._baseObject.read(input) as GenericInfered<T, E>;

    // Making the sub type key available to the result object.
    result.type = subTypeKey as keyof E;

    if (subTypeDescription !== null) {
      for (const [key, extraProp] of exactEntries(
        subTypeDescription.properties,
      )) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (result as any)[key] = extraProp.read(input);
      }
    }

    return result;
  }

  sizeOf(value: GenericInfered<T, E>): number {
    let size = this._baseObject.sizeOf(value as T);

    // We're a generic object trying to encode a concrete value.
    size +=
      this.keyedBy === SubTypeKey.ENUM
        ? 1
        : string.sizeOf(value.type as string);

    // Extra sub-type fields
    const subTypeDescription = this.subTypeMap[value.type] || null;
    if (subTypeDescription === null) {
      throw new Error(
        `Unknown sub-type '${value.type.toString()}' in among '${JSON.stringify(
          Object.keys(this.subTypeMap),
        )}'`,
      );
    }

    size += exactEntries(subTypeDescription.properties) // Going through extra property keys
      .map(([key, prop]) => prop.sizeOf(value[key])) // Mapping extra properties into their sizes
      .reduce((a, b) => a + b, 0); // Summing them up

    return size;
  }
}
