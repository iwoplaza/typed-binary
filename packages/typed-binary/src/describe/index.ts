import {
  type AnyObjectSchema,
  ArraySchema,
  BoolSchema,
  CharsSchema,
  DynamicArraySchema,
  Float16Schema,
  Float32Schema,
  GenericObjectSchema,
  Int32Schema,
  KeyedSchema,
  ObjectSchema,
  OptionalSchema,
  StringSchema,
  SubTypeKey,
  TupleSchema,
  TypedArraySchema,
  Uint32Schema,
} from '../structure';
import {
  Int8Schema,
  Int16Schema,
  Uint8Schema,
  Uint16Schema,
} from '../structure/baseTypes';
import type {
  AnySchema,
  AnySchemaWithProperties,
  ISchema,
  PropertiesOf,
  Ref,
} from '../structure/types';
import type { MergeRecordUnion } from '../utilityTypes';

export const bool = new BoolSchema();

export const string = new StringSchema();

export const i8 = new Int8Schema();
export const u8 = new Uint8Schema();

export const i16 = new Int16Schema();
export const u16 = new Uint16Schema();

export const i32 = new Int32Schema();
export const u32 = new Uint32Schema();

export const f16 = new Float16Schema();
export const f32 = new Float32Schema();

/**
 * Alias for `bin.u8`
 */
export const byte = u8;

export const chars = <T extends number>(length: T) => new CharsSchema(length);

export const object = <P extends Record<string, AnySchema>>(properties: P) =>
  new ObjectSchema(properties);

export const generic = <
  P extends Record<string, AnySchema>,
  S extends {
    [Key in keyof S]: AnySchemaWithProperties;
  },
>(
  properties: P,
  subTypeMap: S,
) => new GenericObjectSchema(SubTypeKey.STRING, properties, subTypeMap);

export const genericEnum = <
  P extends Record<string, AnySchema>,
  S extends {
    [Key in keyof S]: AnySchemaWithProperties;
  },
>(
  properties: P,
  subTypeMap: S,
) => new GenericObjectSchema(SubTypeKey.ENUM, properties, subTypeMap);

export const dynamicArrayOf = <TSchema extends AnySchema>(
  elementSchema: TSchema,
) => new DynamicArraySchema(elementSchema);

export const arrayOf = <TSchema extends AnySchema>(
  elementSchema: TSchema,
  length: number,
) => new ArraySchema(elementSchema, length);

export const tupleOf = <TSchema extends [AnySchema, ...AnySchema[]]>(
  schemas: TSchema,
) => new TupleSchema(schemas);

export const u8Array = (length: number) =>
  new TypedArraySchema(length, Uint8Array);

export const u8ClampedArray = (length: number) =>
  new TypedArraySchema(length, Uint8ClampedArray);

export const u16Array = (length: number) =>
  new TypedArraySchema(length, Uint16Array);

export const u32Array = (length: number) =>
  new TypedArraySchema(length, Uint32Array);

export const i8Array = (length: number) =>
  new TypedArraySchema(length, Int8Array);

export const i16Array = (length: number) =>
  new TypedArraySchema(length, Int16Array);

export const i32Array = (length: number) =>
  new TypedArraySchema(length, Int32Array);

export const f32Array = (length: number) =>
  new TypedArraySchema(length, Float32Array);

export const f64Array = (length: number) =>
  new TypedArraySchema(length, Float64Array);

export const optional = <TSchema extends AnySchema>(innerType: TSchema) =>
  new OptionalSchema(innerType);

export const keyed = <K extends string, P extends ISchema<unknown>>(
  key: K,
  inner: (ref: ISchema<Ref<K>>) => P,
) => new KeyedSchema(key, inner);

type Concat<Objs extends AnyObjectSchema[]> = ObjectSchema<
  MergeRecordUnion<PropertiesOf<Objs[number]>>
>;

export const concat = <Objs extends AnyObjectSchema[]>(
  objs: Objs,
): Concat<Objs> => {
  return new ObjectSchema(
    Object.fromEntries(
      objs.flatMap(({ properties }) => Object.entries(properties)),
    ) as unknown as Concat<Objs>['properties'],
  );
};
