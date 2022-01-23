import { BaseTypeDescription } from './_internal';

export enum TypeKey {
    BOOL = 'BOOL',
    BYTE = 'BYTE',
    INT = 'INT',
    FLOAT = 'FLOAT',
    STRING = 'STRING',
    CHARS = 'CHARS',
    NULLABLE = 'NULLABLE',
    OBJECT = 'OBJECT',
    ARRAY = 'ARRAY',
    TUPLE = 'TUPLE',
}

export type TypeDescription = ObjectDescription | ArrayDescription | TupleDescription | NullableDescription | CharsDescription | BaseTypeDescription;

////
// CONTEXT
////

export enum SubTypeKey {
    STRING = 'STRING',
    ENUM = 'ENUM',
}

export type SubTypeCategory = {[key: string]: ConcreteObjectDescription};

export interface ISubTypeContext {
    [key: string]: SubTypeCategory;
}

export interface ReadContext {
    subTypes: ISubTypeContext,
    readAny(desc: any): any,
}

export interface WriteContext {
    subTypes: ISubTypeContext,
    writeAny(desc: any, value: any): void,
}

export interface SizeContext {
    subTypes: ISubTypeContext,
    sizeOfAny(desc: any, value: any): number;
}

////
// OBJECT
////

export type PropertyDescription = SimpleObjectDescription | GenericObjectDescription | ArrayDescription | TupleDescription | NullableDescription | CharsDescription | BaseTypeDescription;

export type SimpleObjectDescription = {
    type: TypeKey.OBJECT,
    properties: {
        [key: string]: PropertyDescription,
    },
}

export type GenericObjectDescription = SimpleObjectDescription & {
    subTypeCategory: string,
    /**
     * @default SubTypeKey.STRING
     */
    keyedBy?: SubTypeKey,
};

export type ConcreteObjectDescription = SimpleObjectDescription & {
    subType: string|number,
};

export type ObjectDescription = SimpleObjectDescription | GenericObjectDescription | ConcreteObjectDescription;

////
// CHARS
////

export type CharsDescription = {
    type: TypeKey.CHARS,
    length: number,
};

////
// ARRAY
////

export type ArrayDescription = {
    type: TypeKey.ARRAY,
    elementType: PropertyDescription,
}

////
// TUPLE
////

export type TupleDescription = {
    type: TypeKey.TUPLE,
    elementType: PropertyDescription,
    length: number,
}

////
// NULLABLE
////

export type NullableDescription = {
    type: TypeKey.NULLABLE,
    elementType: PropertyDescription,
}
