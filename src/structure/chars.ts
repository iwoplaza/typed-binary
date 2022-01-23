import { TypedBinaryError } from '../error';
import type { ISerialInput, ISerialOutput } from '../io';
import type { CharsDescription, ReadContext, WriteContext, SizeContext } from './types';

export function readChars<T extends CharsDescription>(_: ReadContext, input: ISerialInput, description: T): string {
    let content = '';

    for (let i = 0; i < description.length; ++i) {
        content += String.fromCharCode(input.readByte());
    }

    return content;
}

export function writeChars<T extends CharsDescription>(_: WriteContext, output: ISerialOutput, description: T, value: string): void {
    if (value.length !== description.length) {
        throw new TypedBinaryError(`Expected char-string of length ${description.length}, got ${value.length}`);
    }

    for (let i = 0; i < value.length; ++i) {
        output.writeByte(value.charCodeAt(i));
    }
}

export function sizeOfChars<T extends CharsDescription>(_: SizeContext, description: T): number {
    return description.length;
}