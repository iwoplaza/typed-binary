import { TypedBinaryError } from '../error';
import type { ISerialInput, ISerialOutput } from '../io';
import { Schema } from './types';

export class CharsSchema extends Schema<string> {
    constructor(public readonly length: number) {
        super();
    }

    write(output: ISerialOutput, value: string): void {
        if (value.length !== this.length) {
            throw new TypedBinaryError(`Expected char-string of length ${this.length}, got ${value.length}`);
        }
    
        for (let i = 0; i < value.length; ++i) {
            output.writeByte(value.charCodeAt(i));
        }
    }

    read(input: ISerialInput): string {
        let content = '';

        for (let i = 0; i < this.length; ++i) {
            content += String.fromCharCode(input.readByte());
        }
    
        return content;
    }

    sizeOf(value: string): number {
        return this.length;
    }
}
