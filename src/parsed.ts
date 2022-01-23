import type { ArrayDescription, CharsDescription, ISubTypeContext, BaseTypeDescription, NullableDescription, ObjectDescription } from './structure';
import { TypeKey, BaseTypeMap } from './structure';

type Values<T extends {[k in keyof T]: T[k]}> = T[keyof T];

export type ParseValues<T extends {[k in keyof T]: T[k]}, C extends ISubTypeContext>
    = {[k in keyof T]: Parsed<T[k], C>};

export type ParsedObject<T extends ObjectDescription, C extends ISubTypeContext, BaseProps = any> =
    // Base-Type
    T extends { type: TypeKey.OBJECT, subTypeCategory: keyof C, properties: infer Properties }
    ? ParsedObject<Values<C[T['subTypeCategory']]>, C, Properties> :
    // Sub-Type
    T extends { type: TypeKey.OBJECT, subType: infer SubType, properties: infer Properties }
    ? ParseValues<Properties & BaseProps & {subType: SubType}, C> :
    // Simple object
    T extends { type: TypeKey.OBJECT, properties: infer Properties }
    ? ParseValues<Properties, C>
    : never;

export type ParsedArray<T extends ArrayDescription, C extends ISubTypeContext> =
    T extends { type: TypeKey.ARRAY, elementType: infer ElementType }
    ? Parsed<ElementType, C>[]
    : never;

export type ParsedNullable<T extends NullableDescription, C extends ISubTypeContext> =
    T extends { type: TypeKey.NULLABLE, element: infer InnerType }
    ? Parsed<InnerType, C> | undefined
    : never;

export type Parsed<T, C extends ISubTypeContext> =
    T extends BaseTypeDescription ? BaseTypeMap[T['type']] :
    T extends ObjectDescription ? ParsedObject<T, C> :
    T extends ArrayDescription ? ParsedArray<T, C> :
    T extends NullableDescription ? ParsedNullable<T, C> :
    T extends CharsDescription ? string :
    T;