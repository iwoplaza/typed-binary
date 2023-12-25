import { ObjectSchema, CharsSchema, SubTypeKey } from '../structure';
import { ArraySchema } from '../structure/array';
import { OptionalSchema } from '../structure/optional';
import { GenericObjectSchema } from '../structure/object';
import { TupleSchema } from '../structure/tuple';
import {
  IUnstableSchema,
  ISchemaWithProperties,
  ISchema,
  Ref,
  SchemaMap,
} from '../structure/types';
import { KeyedSchema } from '../structure/keyed';

export const chars = <T extends number>(length: T) => new CharsSchema(length);

export const object = <
  P extends Record<string, unknown> = Record<string, never>,
>(
  properties: SchemaMap<P>,
) => new ObjectSchema(properties);

export const generic = <
  P extends Record<string, unknown> = Record<string, never>,
  S extends {
    [Key in keyof S]: ISchemaWithProperties<Record<string, unknown>>;
  } = Record<string, never>,
>(
  properties: SchemaMap<P>,
  subTypeMap: S,
) => new GenericObjectSchema(SubTypeKey.STRING, properties, subTypeMap);

export const genericEnum = <
  P extends Record<string, unknown>,
  S extends {
    [Key in keyof S]: ISchemaWithProperties<Record<string, unknown>>;
  },
>(
  properties: SchemaMap<P>,
  subTypeMap: S,
) => new GenericObjectSchema(SubTypeKey.ENUM, properties, subTypeMap);

export const arrayOf = <T extends IUnstableSchema<T['_infered']>>(
  elementType: T,
) => new ArraySchema(elementType);
export const tupleOf = <T extends IUnstableSchema<T['_infered']>>(
  elementType: T,
  length: number,
) => new TupleSchema(elementType, length);
export const optional = <T>(innerType: IUnstableSchema<T>) =>
  new OptionalSchema(innerType);

export const keyed = <K extends string, P extends ISchema<unknown>>(
  key: K,
  inner: (ref: IUnstableSchema<Ref<K>>) => P,
) => new KeyedSchema(key, inner);

export const concat = <Objs extends ObjectSchema<{ [key: string]: unknown }>[]>(
  objs: Objs,
) => {
  return new ObjectSchema(
    Object.fromEntries(
      objs.map(({ properties }) => Object.entries(properties)).flat(),
    ) as unknown as SchemaMap<Objs[number]['_infered']>,
  );
};
