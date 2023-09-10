import { ISerialInput, ISerialOutput } from '../io';
import { Schema } from './types';

////
// BOOL
////

export class BoolSchema extends Schema<boolean> {
  resolve(): void {
    /* Nothing to resolve */
  }

  read(input: ISerialInput): boolean {
    return input.readBool();
  }

  write(output: ISerialOutput, value: boolean): void {
    output.writeBool(value);
  }

  sizeOf(): number {
    return 1;
  }
}

export const bool = new BoolSchema();

////
// STRING
////

export class StringSchema extends Schema<string> {
  resolve(): void {
    /* Nothing to resolve */
  }

  read(input: ISerialInput): string {
    return input.readString();
  }

  write<T extends string>(output: ISerialOutput, value: T): void {
    output.writeString(value);
  }

  sizeOf<T extends string>(value: T): number {
    return value.length + 1;
  }
}

export const string = new StringSchema();

////
// BYTE
////

export class ByteSchema extends Schema<number> {
  resolve(): void {
    /* Nothing to resolve */
  }

  read(input: ISerialInput): number {
    return input.readByte();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeByte(value);
  }

  sizeOf(): number {
    return 1;
  }
}

export const byte = new ByteSchema();

////
// i32
////

export class Int32Schema extends Schema<number> {
  resolve(): void {
    /* Nothing to resolve */
  }

  read(input: ISerialInput): number {
    return input.readInt32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeInt32(value);
  }

  sizeOf(): number {
    return 4;
  }
}

export const i32 = new Int32Schema();

////
// u32
////

export class Uint32Schema extends Schema<number> {
  resolve(): void {
    /* Nothing to resolve */
  }

  read(input: ISerialInput): number {
    return input.readUint32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeUint32(value);
  }

  sizeOf(): number {
    return 4;
  }
}

export const u32 = new Uint32Schema();

////
// FLOAT
////

export class Float32Schema extends Schema<number> {
  resolve(): void {
    /* Nothing to resolve */
  }

  read(input: ISerialInput): number {
    return input.readFloat32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeFloat32(value);
  }

  sizeOf(): number {
    return 4;
  }
}

export const f32 = new Float32Schema();
