import { BaseType } from '../structure/baseTypes';
import { CompoundType, ObjectDescription, SubTypeKey } from '../structure/compoundTypes';

export const BOOL =        { type: BaseType.BOOL as const };
export const BYTE =        { type: BaseType.BYTE as const };
export const INT =         { type: BaseType.INT as const };
export const FLOAT =       { type: BaseType.FLOAT as const };
export const STRING =      { type: BaseType.STRING as const };

export const chars = <T extends number>(length: T) => ({
    type: BaseType.CHARS as const,
    length,
});
export const object = <P>(properties: P) => ({
    type: CompoundType.OBJECT as const,
    properties,
});
export const generic = <T extends string, P>(genericCategory: T, properties: P) => ({
    type: CompoundType.OBJECT as const,
    subTypeCategory: genericCategory,
    properties,
});
export const concreteOf = <G extends ObjectDescription, T extends string, P>(gen: G, concreteType: T, properties: P) => ({
    type: CompoundType.OBJECT as const,
    subType: concreteType,
    properties,
});
export const genericEnum = <T extends string, P>(genericCategory: T, properties: P) => ({
    type: CompoundType.OBJECT as const,
    subTypeCategory: genericCategory,
    keyedBy: SubTypeKey.ENUM,
    properties,
});
export const concreteEnumOf = <G extends ObjectDescription, T extends number, P>(gen: G, concreteType: T, properties: P) => ({
    type: CompoundType.OBJECT as const,
    subType: concreteType,
    properties,
});
export const arrayOf = <T>(elementType: T) => ({
    type: CompoundType.ARRAY as const,
    elementType,
});
export const nullable = <T>(elementType: T) => ({
    type: CompoundType.NULLABLE as const,
    element: elementType,
});