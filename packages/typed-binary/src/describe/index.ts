import {
  BoolSchema,
  CharsSchema,
  ObjectSchema,
  SubTypeKey,
  TupleSchema,
  ArraySchema,
  DynamicArraySchema,
  KeyedSchema,
  OptionalSchema,
  type AnyObjectSchema,
  GenericObjectSchema,
  StringSchema,
  ByteSchema,
  Int32Schema,
  Uint32Schema,
  Float32Schema,
} from '../structure';
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

export const byte = new ByteSchema();

export const i32 = new Int32Schema();

export const u32 = new Uint32Schema();

export const f32 = new Float32Schema();

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
