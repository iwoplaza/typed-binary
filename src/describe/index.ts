import { ObjectSchema, CharsSchema, SubTypeKey } from '../structure';
import { ArraySchema } from '../structure/array';
import { OptionalSchema } from '../structure/optional';
import { GenericObjectSchema } from '../structure/object';
import { TupleSchema } from '../structure/tuple';
import { ISchema, ISchemaWithProperties, IStableSchema, Ref, SchemaMap } from '../structure/types';
import { KeyedSchema } from '../structure/keyed';


export const chars = <T extends number>(length: T) =>
    new CharsSchema(length);

export const object = <P extends {[key: string]: unknown}>(properties: SchemaMap<P>) =>
    new ObjectSchema(properties);

export const generic = <P extends Record<string, unknown>, S extends {[Key in keyof S]: ISchemaWithProperties<Record<string, unknown>>}>(properties: SchemaMap<P>, subTypeMap: S) =>
    new GenericObjectSchema<P, S>(
        SubTypeKey.STRING,
        properties,
        subTypeMap
    );

export const genericEnum = <P extends Record<string, unknown>, S extends {[Key in keyof S]: ISchemaWithProperties<Record<string, unknown>>}>(properties: SchemaMap<P>, subTypeMap: S) =>
    new GenericObjectSchema<P, S>(
        SubTypeKey.ENUM,
        properties,
        subTypeMap
    );

export const arrayOf = <T extends ISchema<T['_infered']>>(elementType: T) =>
    new ArraySchema(elementType);

export const tupleOf = <T extends ISchema<T['_infered']>>(elementType: T, length: number) =>
    new TupleSchema(elementType, length);

export const optional = <T>(innerType: ISchema<T>) =>
    new OptionalSchema(innerType);

export const keyed = <K extends string, P extends IStableSchema<unknown>>(key: K, inner: (ref: ISchema<Ref<K>>) => P) =>
    new KeyedSchema(key, inner);
