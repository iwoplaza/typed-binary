import { Measurer } from '../io/measurer.ts';
import type { ByteCursor } from '../io/cursor.ts';
import { MaxValue, type Schema } from './types.ts';

////
// BOOL
////

export interface Bool extends Schema<boolean> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 1;
}

class BoolImpl implements Bool {
  get maxSize(): 1 {
    return 1;
  }

  read(cursor: ByteCursor): boolean {
    return cursor.view.getUint8(cursor.offset++) !== 0;
  }

  write(cursor: ByteCursor, value: boolean): void {
    cursor.view.setUint8(cursor.offset++, value ? 1 : 0);
  }

  measure(_: boolean | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(1);
  }
}

export const bool: Bool = /* @__PURE__ */ new BoolImpl();

////
// STRING
////

export interface String extends Schema<string, string> {
  /**
   * The maximum number of bytes this schema can take up.
   * Always `NaN`, as strings can be of any length.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: number;
}

// Created on first use, so that defining the `string` schema doesn't have side effects
let cachedEncoder: TextEncoder | undefined;
let cachedDecoder: TextDecoder | undefined;

function getEncoder(): TextEncoder {
  return (cachedEncoder ??= new TextEncoder());
}

function getDecoder(): TextDecoder {
  return (cachedDecoder ??= new TextDecoder(undefined, { fatal: true }));
}

class StringImpl implements String {
  get maxSize(): number {
    return Number.NaN;
  }

  read(cursor: ByteCursor): string {
    const { view } = cursor;
    // Looking for the 'NULL' byte.
    let strLength = 0;
    while (cursor.offset + strLength < view.byteLength) {
      if (view.getUint8(cursor.offset + strLength++) === 0) {
        break;
      }
    }

    const result = getDecoder().decode(
      new Uint8Array(view.buffer, view.byteOffset + cursor.offset, strLength - 1),
    );

    cursor.offset += strLength;

    return result;
  }

  write<T extends string>(cursor: ByteCursor, value: T): void {
    const { view } = cursor;
    const result = getEncoder().encodeInto(
      value,
      new Uint8Array(view.buffer, view.byteOffset + cursor.offset, view.byteLength - cursor.offset),
    );
    cursor.offset += result.written;

    // Extra null character
    view.setUint8(cursor.offset++, 0);
  }

  measure(value: string | typeof MaxValue, measurer: Measurer = new Measurer()): Measurer {
    if (value === MaxValue) {
      // A string cannot be bound
      return measurer.unbounded;
    }
    const encoded = getEncoder().encode(value);
    return measurer.add(encoded.byteLength + 1);
  }
}

export const string: String = /* @__PURE__ */ new StringImpl();

////
// i8
////

export interface Int8 extends Schema<number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 1;
}

class Int8Impl implements Int8 {
  get maxSize(): 1 {
    return 1;
  }

  read(cursor: ByteCursor): number {
    return cursor.view.getInt8(cursor.offset++);
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setInt8(cursor.offset++, value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(1);
  }
}

export const i8: Int8 = /* @__PURE__ */ new Int8Impl();

////
// u8
////

export interface Uint8 extends Schema<number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 1;
}

class Uint8Impl implements Uint8 {
  get maxSize(): 1 {
    return 1;
  }

  read(cursor: ByteCursor): number {
    return cursor.view.getUint8(cursor.offset++);
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setUint8(cursor.offset++, value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(1);
  }
}

export const u8: Uint8 = /* @__PURE__ */ new Uint8Impl();

////
// i16
////

export interface Int16 extends Schema<number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 2;
}

class Int16Impl implements Int16 {
  get maxSize(): 2 {
    return 2;
  }

  read(cursor: ByteCursor): number {
    const value = cursor.view.getInt16(cursor.offset, cursor.littleEndian);
    cursor.offset += 2;
    return value;
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setInt16(cursor.offset, value, cursor.littleEndian);
    cursor.offset += 2;
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(2);
  }
}

export const i16: Int16 = /* @__PURE__ */ new Int16Impl();

////
// u16
////

export interface Uint16 extends Schema<number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 2;
}

class Uint16Impl implements Uint16 {
  get maxSize(): 2 {
    return 2;
  }

  read(cursor: ByteCursor): number {
    const value = cursor.view.getUint16(cursor.offset, cursor.littleEndian);
    cursor.offset += 2;
    return value;
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setUint16(cursor.offset, value, cursor.littleEndian);
    cursor.offset += 2;
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(2);
  }
}

export const u16: Uint16 = /* @__PURE__ */ new Uint16Impl();

////
// i32
////

export interface Int32 extends Schema<number, number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 4;
}

class Int32Impl implements Int32 {
  get maxSize(): 4 {
    return 4;
  }

  read(cursor: ByteCursor): number {
    const value = cursor.view.getInt32(cursor.offset, cursor.littleEndian);
    cursor.offset += 4;
    return value;
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setInt32(cursor.offset, value, cursor.littleEndian);
    cursor.offset += 4;
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(4);
  }
}

export const i32: Int32 = /* @__PURE__ */ new Int32Impl();

////
// u32
////

export interface Uint32 extends Schema<number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 4;
}

class Uint32Impl implements Uint32 {
  get maxSize(): 4 {
    return 4;
  }

  read(cursor: ByteCursor): number {
    const value = cursor.view.getUint32(cursor.offset, cursor.littleEndian);
    cursor.offset += 4;
    return value;
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setUint32(cursor.offset, value, cursor.littleEndian);
    cursor.offset += 4;
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(4);
  }
}

export const u32: Uint32 = /* @__PURE__ */ new Uint32Impl();

////
// f16
////

export interface Float16 extends Schema<number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 2;
}

class Float16Impl implements Float16 {
  get maxSize(): 2 {
    return 2;
  }

  read(cursor: ByteCursor): number {
    const value = cursor.view.getFloat16(cursor.offset, cursor.littleEndian);
    cursor.offset += 2;
    return value;
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setFloat16(cursor.offset, value, cursor.littleEndian);
    cursor.offset += 2;
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(2);
  }
}

export const f16: Float16 = /* @__PURE__ */ new Float16Impl();

////
// f32
////

export interface Float32 extends Schema<number> {
  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: 4;
}

class Float32Impl implements Float32 {
  get maxSize(): 4 {
    return 4;
  }

  read(cursor: ByteCursor): number {
    const value = cursor.view.getFloat32(cursor.offset, cursor.littleEndian);
    cursor.offset += 4;
    return value;
  }

  write(cursor: ByteCursor, value: number): void {
    cursor.view.setFloat32(cursor.offset, value, cursor.littleEndian);
    cursor.offset += 4;
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(4);
  }
}

export const f32: Float32 = /* @__PURE__ */ new Float32Impl();
