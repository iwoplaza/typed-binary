import { INT } from '../describe';
import type { ISerialInput, ISerialOutput } from '../io';
import type { ArrayDescription, ReadContext, WriteContext, SizeContext } from './types';


export function readArray<T extends ArrayDescription>(ctx: ReadContext, input: ISerialInput, arrayType: T): any {
    const array = [];

    const len = input.readInt();

    for (let i = 0; i < len; ++i) {
        array.push(ctx.readAny(arrayType.elementType));
    }

    return array;
}

export function writeArray<T extends ArrayDescription>(ctx: WriteContext, output: ISerialOutput, arrayType: T, values: any): void {
    output.writeInt(values.length);

    for (const value of values) {
        ctx.writeAny(arrayType.elementType, value);
    }
}

export function sizeOfArray<T extends ArrayDescription>(ctx: SizeContext, arrayType: T, values: any[]): number {
    const len = values.length;

    // Length encoding
    let size = ctx.sizeOfAny(INT, len);
    // Values encoding
    size += values.map((v: any) => ctx.sizeOfAny(arrayType.elementType, v)).reduce((a, b) => a + b);

    return size;
}