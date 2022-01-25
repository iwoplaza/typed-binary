import type { ISerialInput, ISerialOutput } from '../io';
import { OptionalUndefined } from '../utilityTypes';
import { INT } from './baseTypes';
import { Schema } from './types';


export class ArraySchema<T> extends Schema<T[]> {
    constructor(public readonly elementType: Schema<T>) {
        super();
    }

    write(output: ISerialOutput, values: OptionalUndefined<T[]>): void {
        output.writeInt((values as T[]).length);

        for (const value of (values as T[])) {
            this.elementType.write(output, value as OptionalUndefined<T>);
        }
    }

    read(input: ISerialInput): OptionalUndefined<T[]> {
        const array = [];

        const len = input.readInt();
    
        for (let i = 0; i < len; ++i) {
            array.push(this.elementType.read(input));
        }
    
        return array as OptionalUndefined<T[]>;
    }

    sizeOf(values: OptionalUndefined<T[]>): number {
        // Length encoding
        let size = INT.sizeOf();
        // Values encoding
        size += (values as T[]).map((v) => this.elementType.sizeOf(v as OptionalUndefined<T>)).reduce((a, b) => a + b, 0);
    
        return size;
    }
}
