import { ObjectDescription, TypeKey, SubTypeKey } from '../structure';

export const BOOL =        { type: TypeKey.BOOL as const };
export const BYTE =        { type: TypeKey.BYTE as const };
export const INT =         { type: TypeKey.INT as const };
export const FLOAT =       { type: TypeKey.FLOAT as const };
export const STRING =      { type: TypeKey.STRING as const };

export const chars = <T extends number>(length: T) => ({
    type: TypeKey.CHARS as const,
    length,
});
export const object = <P>(properties: P) => ({
    type: TypeKey.OBJECT as const,
    properties,
});
export const generic = <T extends string, P>(genericCategory: T, properties: P) => ({
    type: TypeKey.OBJECT as const,
    subTypeCategory: genericCategory,
    properties,
});
export const concreteOf = <G extends ObjectDescription, T extends string, P>(gen: G, concreteType: T, properties: P) => ({
    type: TypeKey.OBJECT as const,
    subType: concreteType,
    properties,
});
export const genericEnum = <T extends string, P>(genericCategory: T, properties: P) => ({
    type: TypeKey.OBJECT as const,
    subTypeCategory: genericCategory,
    keyedBy: SubTypeKey.ENUM,
    properties,
});
export const concreteEnumOf = <G extends ObjectDescription, T extends number, P>(gen: G, concreteType: T, properties: P) => ({
    type: TypeKey.OBJECT as const,
    subType: concreteType,
    properties,
});
export const arrayOf = <T>(elementType: T) => ({
    type: TypeKey.ARRAY as const,
    elementType,
});
export const tupleOf = <T, L extends number>(elementType: T, length: L) => ({
    type: TypeKey.TUPLE as const,
    elementType,
    length
});

export const nullable = <T>(elementType: T) => ({
    type: TypeKey.NULLABLE as const,
    element: elementType,
});