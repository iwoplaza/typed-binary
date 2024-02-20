import {
  ObjectSchema,
  CharsSchema,
  SubTypeKey,
  TupleSchema,
} from '../structure';
import { DynamicArraySchema } from '../structure/dynamicArray';
import { OptionalSchema } from '../structure/optional';
import { AnyObjectSchema, GenericObjectSchema } from '../structure/object';
import { ArraySchema } from '../structure/array';
import {
  ISchema,
  Ref,
  AnySchema,
  Unwrap,
  AnySchemaWithProperties,
} from '../structure/types';
import { KeyedSchema } from '../structure/keyed';
import { MergeRecordUnion } from '../utilityTypes';

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

export const concat = <Objs extends AnyObjectSchema[]>(objs: Objs) => {
  return new ObjectSchema(
    Object.fromEntries(
      objs.map(({ properties }) => Object.entries(properties)).flat(),
    ) as unknown as MergeRecordUnion<Unwrap<Objs[number]>>,
  );
};
