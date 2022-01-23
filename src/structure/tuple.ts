import { TypedBinaryError } from '../error';
import type { ISerialInput, ISerialOutput } from '../io';
import type { TupleDescription, ReadContext, WriteContext, SizeContext } from './types';


export function readTuple<T extends TupleDescription>(ctx: ReadContext, input: ISerialInput, description: T): any {
    const array = [];

    for (let i = 0; i < description.length; ++i) {
        array.push(ctx.readAny(description.elementType));
    }

    return array;
}

export function writeTuple<T extends TupleDescription>(ctx: WriteContext, output: ISerialOutput, description: T, values: any[]): void {
    if (values.length !== description.length) {
        throw new TypedBinaryError(`Expected tuple of length ${description.length}, got ${values.length}`);
    }

    for (const value of values) {
        ctx.writeAny(description.elementType, value);
    }
}

export function sizeOfTuple<T extends TupleDescription>(ctx: SizeContext, description: T, values: any[]): number {
    // Values encoding
    return values.map((v: any) => ctx.sizeOfAny(description.elementType, v)).reduce((a, b) => a + b);
}