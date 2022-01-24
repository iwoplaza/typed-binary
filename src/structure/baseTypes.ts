import { ISerialInput, ISerialOutput } from '../io';
import { Schema } from './types';

////
// BOOL
////

export class BoolSchema extends Schema<boolean> {
    read(input: ISerialInput): boolean {
        return input.readBool();
    }

    write(output: ISerialOutput, value: boolean): void {
        output.writeBool(value);
    }

    sizeOf(value: boolean): number {
        return 1;
    }
}

export const BOOL = new BoolSchema();

////
// STRING
////

export class StringSchema extends Schema<string> {
    read(input: ISerialInput): string {
        return input.readString();
    }

    write(output: ISerialOutput, value: string): void {
        output.writeString(value);
    }

    sizeOf(value: string): number {
        return value.length + 1;
    }
}

export const STRING = new StringSchema();

////
// BYTE
////

export class ByteSchema extends Schema<number> {
    read(input: ISerialInput): number {
        return input.readByte();
    }

    write(output: ISerialOutput, value: number): void {
        output.writeByte(value);
    }

    sizeOf(value: number): number {
        return 1;
    }
}

export const BYTE = new ByteSchema();

////
// INT
////

export class IntSchema extends Schema<number> {
    read(input: ISerialInput): number {
        return input.readInt();
    }

    write(output: ISerialOutput, value: number): void {
        output.writeInt(value);
    }

    sizeOf(value: number): number {
        return 4;
    }
}

export const INT = new IntSchema();

////
// FLOAT
////

export class FloatSchema extends Schema<number> {
    read(input: ISerialInput): number {
        return input.readFloat();
    }

    write(output: ISerialOutput, value: number): void {
        output.writeFloat(value);
    }

    sizeOf(_: number): number {
        return 4;
    }
}

export const FLOAT = new FloatSchema();