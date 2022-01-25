import { TypedBinaryError } from '../error';
import { Schema } from './types';
import type { ISerialInput, ISerialOutput } from '../io';
import { OptionalUndefined } from '../utilityTypes';

export class TupleSchema<T> extends Schema<T[]> {
    constructor(public readonly elementType: Schema<T>, public readonly length: number) {
        super();
    }

    write(output: ISerialOutput, values: OptionalUndefined<T[]>): void {
        if ((values as T[]).length !== this.length) {
            throw new TypedBinaryError(`Expected tuple of length ${this.length}, got ${(values as T[]).length}`);
        }
    
        for (const value of (values as T[])) {
            this.elementType.write(output, value as OptionalUndefined<T>);
        }
    }

    read(input: ISerialInput): OptionalUndefined<T[]> {
        const array = [];

        for (let i = 0; i < this.length; ++i) {
            array.push(this.elementType.read(input));
        }
    
        return array as OptionalUndefined<T[]>;
    }

    sizeOf(values: OptionalUndefined<T[]>): number {
        return (values as T[]).map(v => this.elementType.sizeOf(v as OptionalUndefined<T>)).reduce((a, b) => a + b);
    }
}
