import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { MaxValue, Schema } from './types.ts';

////
// BOOL
////

export interface Bool extends Schema<boolean> {}

class BoolSchema implements Bool {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 1;

  read(input: ISerialInput): boolean {
    return input.readBool();
  }

  write(output: ISerialOutput, value: boolean): void {
    output.writeBool(value);
  }

  measure(_: boolean | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(1);
  }
}

export const bool: Bool = new BoolSchema();

////
// STRING
////

export interface String extends Schema<string, string> {}

class StringSchema implements String {
  declare readonly $in: string;
  declare readonly $out: string;

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

  measure(value: string | typeof MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    if (value === MaxValue) {
      // A string cannot be bound
      return measurer.unbounded;
    }
    const encoded = StringSchema._encoder.encode(value);
    return measurer.add(encoded.byteLength + 1);
  }
}

export const string: String = new StringSchema();

////
// i8
////

export interface Int8 extends Schema<number> {}

class Int8Schema implements Int8 {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 1;

  read(input: ISerialInput): number {
    return input.readInt8();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeInt8(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(1);
  }
}

export const i8: Int8 = new Int8Schema();

////
// u8
////

export interface Uint8 extends Schema<number> {}

class Uint8Schema implements Uint8 {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 1;

  read(input: ISerialInput): number {
    return input.readUint8();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeUint8(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(1);
  }
}

export const u8: Uint8 = new Uint8Schema();

////
// i16
////

export interface Int16 extends Schema<number> {}

class Int16Schema implements Int16 {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 2;

  read(input: ISerialInput): number {
    return input.readInt16();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeInt16(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(2);
  }
}

export const i16: Int16 = new Int16Schema();

////
// u16
////

export interface Uint16 extends Schema<number> {}

class Uint16Schema implements Uint16 {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 2;

  read(input: ISerialInput): number {
    return input.readUint16();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeUint16(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(2);
  }
}

export const u16: Uint16 = new Uint16Schema();

////
// i32
////

export interface Int32 extends Schema<number, number> {}

class Int32Schema implements Int32 {
  declare readonly $in: number;
  declare readonly $out: number;

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 4;

  read(input: ISerialInput): number {
    return input.readInt32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeInt32(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(4);
  }
}

export const i32: Int32 = new Int32Schema();

////
// u32
////

export interface Uint32 extends Schema<number> {}

class Uint32Schema implements Uint32 {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 4;

  read(input: ISerialInput): number {
    return input.readUint32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeUint32(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(4);
  }
}

export const u32: Uint32 = new Uint32Schema();

////
// f16
////

export interface Float16 extends Schema<number> {}

class Float16Schema implements Float16 {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 2;

  read(input: ISerialInput): number {
    return input.readFloat16();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeFloat16(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(2);
  }
}

export const f16: Float16 = new Float16Schema();

////
// f32
////

export interface Float32 extends Schema<number> {}

class Float32Schema implements Float32 {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize = 4;

  read(input: ISerialInput): number {
    return input.readFloat32();
  }

  write(output: ISerialOutput, value: number): void {
    output.writeFloat32(value);
  }

  measure(_: number | MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(4);
  }
}

export const f32: Float32 = new Float32Schema();
