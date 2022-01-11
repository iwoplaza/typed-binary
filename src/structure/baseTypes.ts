import { ISerialInput, ISerialOutput } from '../io/types';

export enum BaseType {
    BOOL = 'BOOL',
    BYTE = 'BYTE',
    INT = 'INT',
    FLOAT = 'FLOAT',
    STRING = 'STRING',
    CHARS = 'CHARS',
}

export type BaseTypeMap = {
    [BaseType.BOOL]: boolean,
    [BaseType.BYTE]: number,
    [BaseType.INT]: number,
    [BaseType.FLOAT]: number,
    [BaseType.STRING]: string,
    [BaseType.CHARS]: string,
};

export type BaseTypeDescription = {
    type: BaseType,
};

export type CharsDescription = BaseTypeDescription & {
    length: number,
};

/*
* IO
*/

export function readChars<T extends CharsDescription>(input: ISerialInput, description: T): string {
    let content = '';

    for (let i = 0; i < description.length; ++i) {
        content += String.fromCharCode(input.readByte());
    }

    return content;
}

export function readBaseType<T extends BaseTypeDescription>(input: ISerialInput, desciprion: T): BaseTypeMap[T['type']] {
    if (desciprion.type === BaseType.BOOL) {
        return input.readBool() as any;
    }
    else if (desciprion.type === BaseType.BYTE) {
        return input.readByte() as any;
    }
    else if (desciprion.type === BaseType.INT) {
        return input.readInt() as any;
    }
    else if (desciprion.type === BaseType.FLOAT) {
        return input.readFloat() as any;
    }
    else if (desciprion.type === BaseType.STRING) {
        return input.readString() as any;
    }
    else {
        throw new Error(`Unknown base type: ${desciprion.type}`);
    }
}

export function writeChars<T extends CharsDescription>(output: ISerialOutput, description: T, value: string): void {
    if (value.length !== description.length) {
        throw new Error(`Expected char-string of length ${description.length}, got ${value.length}`);
    }

    for (let i = 0; i < value.length; ++i) {
        output.writeByte(value.charCodeAt(i));
    }
}

export function writeBaseType<T extends BaseTypeDescription>(output: ISerialOutput, description: T, value: BaseTypeMap[T['type']]): void {
    if (description.type === BaseType.BOOL) {
        output.writeBool(value as boolean);
    }
    else if (description.type === BaseType.BYTE) {
        output.writeByte(value as number);
    }
    else if (description.type === BaseType.INT) {
        output.writeInt(value as number);
    }
    else if (description.type === BaseType.FLOAT) {
        output.writeFloat(value as number);
    }
    else if (description.type === BaseType.STRING) {
        output.writeString(value as string);
    }
    else {
        throw new Error(`Unknown base type: ${description.type}`);
    }
}