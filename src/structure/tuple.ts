import { TypedBinaryError } from '../error';
import { Schema } from './types';
import type { ISerialInput, ISerialOutput } from '../io';

export class TupleSchema<T> extends Schema<T[]> {
    constructor(public readonly elementType: Schema<T>, public readonly length: number) {
        super();
    }

    write(output: ISerialOutput, values: T[]): void {
        if (values.length !== this.length) {
            throw new TypedBinaryError(`Expected tuple of length ${this.length}, got ${values.length}`);
        }
    
        for (const value of values) {
            this.elementType.write(output, value);
        }
    }

    read(input: ISerialInput): T[] {
        const array = [];

        for (let i = 0; i < this.length; ++i) {
            array.push(this.elementType.read(input));
        }
    
        return array;
    }

    sizeOf(values: T[]): number {
        return values.map((v: any) => this.elementType.sizeOf(v)).reduce((a, b) => a + b);
    }
}
