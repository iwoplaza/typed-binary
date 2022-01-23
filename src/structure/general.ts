import { ISerialInput, ISerialOutput } from '../io';
import { Parsed } from '../parsed';

import type { ISubTypeContext, ReadContext, SizeContext, WriteContext } from './types';
import {
    TypeKey,
    ArrayDescription,
    CharsDescription,
    NullableDescription,
    ObjectDescription,
    PropertyDescription,
} from './types';
import { BaseTypeDescription } from './baseTypes';
import {
    readArray, writeArray,
    readChars, writeChars,
    readNullable, writeNullable,
    readObject, writeObject,
    sizeOfArray,
    sizeOfChars,
    sizeOfNullable,
    sizeOfObject,
} from './_internal';

export type TypeDescription = ObjectDescription | ArrayDescription | NullableDescription | CharsDescription | BaseTypeDescription;

type SchemaMap = {
    [TypeKey.BOOL]: BaseTypeDescription,
    [TypeKey.BYTE]: BaseTypeDescription,
    [TypeKey.INT]: BaseTypeDescription,
    [TypeKey.FLOAT]: BaseTypeDescription,
    [TypeKey.STRING]: BaseTypeDescription,
    [TypeKey.NULLABLE]: NullableDescription,
    [TypeKey.OBJECT]: ObjectDescription,
    [TypeKey.ARRAY]: ArrayDescription,
    [TypeKey.CHARS]: CharsDescription,
};

const typeSizeMap = {
    [TypeKey.BOOL]: () => 1,
    [TypeKey.BYTE]: () => 1,
    [TypeKey.INT]: () => 4,
    [TypeKey.FLOAT]: () => 4,
    [TypeKey.STRING]: (_: any, __: any, value: string) => value.length + 1, // Characters + '\0' terminal character.
    [TypeKey.NULLABLE]: sizeOfNullable,
    [TypeKey.OBJECT]: sizeOfObject,
    [TypeKey.ARRAY]: sizeOfArray,
    [TypeKey.CHARS]: sizeOfChars,
};

export const typeReaderMap: {[key in TypeKey]: (ctx: ReadContext, input: ISerialInput, desc: SchemaMap[key]) => any} = {
    [TypeKey.BOOL]:   (_, input, __) => input.readBool(),
    [TypeKey.BYTE]:   (_, input, __) => input.readByte(),
    [TypeKey.INT]:    (_, input, __) => input.readInt(),
    [TypeKey.FLOAT]:  (_, input, __) => input.readFloat(),
    [TypeKey.STRING]: (_, input, __) => input.readString(),
    [TypeKey.NULLABLE]: readNullable,
    [TypeKey.OBJECT]: readObject,
    [TypeKey.ARRAY]: readArray,
    [TypeKey.CHARS]: readChars,
} as const;

export const typeWriterMap: {[key in TypeKey]: (ctx: WriteContext, output: ISerialOutput, desc: SchemaMap[key], value: any) => void} = {
    [TypeKey.BOOL]:   (ctx, output, desc, value) => output.writeBool(value),
    [TypeKey.BYTE]:   (ctx, output, desc, value) => output.writeByte(value),
    [TypeKey.INT]:    (ctx, output, desc, value) => output.writeInt(value),
    [TypeKey.FLOAT]:  (ctx, output, desc, value) => output.writeFloat(value),
    [TypeKey.STRING]: (ctx, output, desc, value) => output.writeString(value),
    [TypeKey.NULLABLE]: writeNullable,
    [TypeKey.OBJECT]: writeObject,
    [TypeKey.ARRAY]: writeArray,
    [TypeKey.CHARS]: writeChars,
} as const;

export function sizeOf<T extends TypeDescription, C extends ISubTypeContext = {}>(subTypeContext: C, desc: T, value: Parsed<T, C>): number {
    const sizeContext: SizeContext = {
        subTypes: subTypeContext,
        sizeOfAny: (desc, value) => sizeOf(subTypeContext, desc, value),
    };
    // @ts-ignore
    return typeSizeMap[desc.type](sizeContext, desc, value as any);
}

export function readSerial<T extends PropertyDescription, C extends ISubTypeContext = {}>(subTypeContext: C, input: ISerialInput, description: T): Parsed<T, C> {
    const readContext: ReadContext = {
        subTypes: subTypeContext,
        readAny: (desc) => readSerial(subTypeContext, input, desc),
    };
    return typeReaderMap[description.type](readContext, input, description as any);
}

export function writeSerial<T extends PropertyDescription, C extends ISubTypeContext = {}>(subTypeContext: C, output: ISerialOutput, description: T, value: Parsed<T, C>) {
    const writeContext: WriteContext = {
        subTypes: subTypeContext,
        writeAny: (desc, val) => writeSerial(subTypeContext, output, desc, val),
    };
    
    console.log({ typeWriterMap });

    // @ts-ignore
    typeWriterMap[description.type](writeContext, output, description as any, value as any);
}
