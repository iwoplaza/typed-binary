import { ObjectSchema, CharsSchema, SubTypeKey } from '../structure';
import { ArraySchema } from '../structure/array';
import { OptionalSchema } from '../structure/optional';
import { GenericObjectSchema, InferedSubTypes } from '../structure/object';
import { TupleSchema } from '../structure/tuple';
import { ISchema, SchemaProperties } from '../structure/types';
import { ValueOrProvider } from '../utilityTypes';



export const chars = <T extends number>(length: T) =>
    new CharsSchema(length);

export const object = <P extends SchemaProperties>(properties: ValueOrProvider<P>) =>
    new ObjectSchema(properties);

export const typedObject = <P>(properties: ValueOrProvider<unknown>) =>
    new ObjectSchema<any, P>(properties);

export const generic = <P extends SchemaProperties, S extends {[key in keyof S]: ObjectSchema<any>}>(properties: P, subTypeMap: ValueOrProvider<S>) =>
    new GenericObjectSchema(
        SubTypeKey.STRING as any,
        properties,
        subTypeMap
    );

export class TypeToken<I> {
    readonly _infered!: I;
}

export interface Ref<I> extends ISchema<I> {
    readonly _infered: I;
}

export const ref = <I>(inner: any): Ref<I> => inner as unknown as Ref<I>;

export const typedGeneric = <P, S extends {[Key in keyof S]: ObjectSchema<SchemaProperties, any>}>(token: TypeToken<P>, properties: ValueOrProvider<unknown>, subTypeMap: S) =>
    new GenericObjectSchema<any, S, SubTypeKey.STRING, P & InferedSubTypes<S>[keyof S]>(
        SubTypeKey.STRING,
        properties,
        subTypeMap
    );

export const genericEnum = <P extends SchemaProperties, S extends {[key in keyof S]: ObjectSchema<any>}>(properties: P, subTypeMap: ValueOrProvider<S>) =>
    new GenericObjectSchema(
        SubTypeKey.ENUM as any,
        properties,
        subTypeMap
    );

export const arrayOf = <T extends ISchema<T['_infered']>>(elementType: T) =>
    new ArraySchema(elementType);

export const tupleOf = <T extends ISchema<T['_infered']>>(elementType: T, length: number) =>
    new TupleSchema(elementType, length);

export const optional = <T extends ISchema<T['_infered']>>(innerType: T) =>
    new OptionalSchema(innerType);
