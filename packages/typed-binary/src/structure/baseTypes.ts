import {
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
  Measurer,
} from '../io';
import { MaxValue, Schema } from './types';

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

  measure(
    _: boolean | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(1);
  }
}

////
// STRING
////

export class StringSchema extends Schema<string> {
  private static _cachedEncoder: TextEncoder | undefined;
  private static get _encoder() {
    if (!StringSchema._cachedEncoder) {
      StringSchema._cachedEncoder = new TextEncoder();
    }
    return StringSchema._cachedEncoder;
  }

  read(input: ISerialInput): string {
    return input.readString();
  }

  write<T extends string>(output: ISerialOutput, value: T): void {
    output.writeString(value);
  }

  measure(
    value: string | typeof MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    if (value === MaxValue) {
      // A string cannot be bound
      return measurer.unbounded;
    }
    const encoded = StringSchema._encoder.encode(value);
    return measurer.add(encoded.byteLength + 1);
  }
}

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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(1);
  }
}

////
// i32
////

export class Int32Schema extends Schema<number> {
  read(input: ISerialInput): number {
    return input.readInt32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeInt32(value);
  }

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(4);
  }
}

////
// u32
////

export class Uint32Schema extends Schema<number> {
  read(input: ISerialInput): number {
    return input.readUint32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeUint32(value);
  }

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(4);
  }
}

////
// FLOAT
////

export class Float32Schema extends Schema<number> {
  read(input: ISerialInput): number {
    return input.readFloat32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeFloat32(value);
  }

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(4);
  }
}
