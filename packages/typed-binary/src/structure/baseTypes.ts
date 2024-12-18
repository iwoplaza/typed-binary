import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { MaxValue, Schema } from './types.ts';

////
// BOOL
////

export class BoolSchema extends Schema<boolean> {
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

  measure(
    _: boolean | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(1);
  }
}

export const bool: BoolSchema = new BoolSchema();

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

export const string: StringSchema = new StringSchema();

////
// i8
////

export class Int8Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(1);
  }
}

export const i8: Int8Schema = new Int8Schema();

////
// u8
////

export class Uint8Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(1);
  }
}

export const u8: Uint8Schema = new Uint8Schema();

/**
 * Alias for `bin.u8`
 */
export const byte: Uint8Schema = u8;

////
// i16
////

export class Int16Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(2);
  }
}

export const i16: Int16Schema = new Int16Schema();

////
// u16
////

export class Uint16Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(2);
  }
}

export const u16: Uint16Schema = new Uint16Schema();

////
// i32
////

export class Int32Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(4);
  }
}

export const i32: Int32Schema = new Int32Schema();

////
// u32
////

export class Uint32Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(4);
  }
}

export const u32: Uint32Schema = new Uint32Schema();

////
// f16
////

export class Float16Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(2);
  }
}

export const f16: Float16Schema = new Float16Schema();

////
// f32
////

export class Float32Schema extends Schema<number> {
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

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(4);
  }
}

export const f32: Float32Schema = new Float32Schema();
