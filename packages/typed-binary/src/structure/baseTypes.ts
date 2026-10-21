import { Measurer } from '../io/measurer.ts';
import type { SerialInput, SerialOutput } from '../io/types.ts';
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

class BoolSchema implements Bool {
  get maxSize(): 1 {
    return 1;
  }

  read(input: SerialInput): boolean {
    return input.readBool();
  }

  write(output: SerialOutput, value: boolean): void {
    output.writeBool(value);
  }

  measure(_: boolean | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(1);
  }
}

export const bool: Bool = /* @__PURE__ */ new BoolSchema();

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

class StringSchema implements String {
  static #cachedEncoder: TextEncoder | undefined;

  get maxSize(): number {
    return Number.NaN;
  }

  private static get _encoder() {
    if (!StringSchema.#cachedEncoder) {
      StringSchema.#cachedEncoder = new TextEncoder();
    }
    return StringSchema.#cachedEncoder;
  }

  read(input: SerialInput): string {
    return input.readString();
  }

  write<T extends string>(output: SerialOutput, value: T): void {
    output.writeString(value);
  }

  measure(value: string | typeof MaxValue, measurer: Measurer = new Measurer()): Measurer {
    if (value === MaxValue) {
      // A string cannot be bound
      return measurer.unbounded;
    }
    const encoded = StringSchema._encoder.encode(value);
    return measurer.add(encoded.byteLength + 1);
  }
}

export const string: String = /* @__PURE__ */ new StringSchema();

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

class Int8Schema implements Int8 {
  get maxSize(): 1 {
    return 1;
  }

  read(input: SerialInput): number {
    return input.readInt8();
  }

  write(output: SerialOutput, value: number): void {
    output.writeInt8(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(1);
  }
}

export const i8: Int8 = /* @__PURE__ */ new Int8Schema();

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

class Uint8Schema implements Uint8 {
  get maxSize(): 1 {
    return 1;
  }

  read(input: SerialInput): number {
    return input.readUint8();
  }

  write(output: SerialOutput, value: number): void {
    output.writeUint8(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(1);
  }
}

export const u8: Uint8 = /* @__PURE__ */ new Uint8Schema();

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

class Int16Schema implements Int16 {
  get maxSize(): 2 {
    return 2;
  }

  read(input: SerialInput): number {
    return input.readInt16();
  }

  write(output: SerialOutput, value: number): void {
    output.writeInt16(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(2);
  }
}

export const i16: Int16 = /* @__PURE__ */ new Int16Schema();

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

class Uint16Schema implements Uint16 {
  get maxSize(): 2 {
    return 2;
  }

  read(input: SerialInput): number {
    return input.readUint16();
  }

  write(output: SerialOutput, value: number): void {
    output.writeUint16(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(2);
  }
}

export const u16: Uint16 = /* @__PURE__ */ new Uint16Schema();

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

class Int32Schema implements Int32 {
  get maxSize(): 4 {
    return 4;
  }

  read(input: SerialInput): number {
    return input.readInt32();
  }

  write(output: SerialOutput, value: number): void {
    output.writeInt32(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(4);
  }
}

export const i32: Int32 = /* @__PURE__ */ new Int32Schema();

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

class Uint32Schema implements Uint32 {
  get maxSize(): 4 {
    return 4;
  }

  read(input: SerialInput): number {
    return input.readUint32();
  }

  write(output: SerialOutput, value: number): void {
    output.writeUint32(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(4);
  }
}

export const u32: Uint32 = /* @__PURE__ */ new Uint32Schema();

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

class Float16Schema implements Float16 {
  get maxSize(): 2 {
    return 2;
  }

  read(input: SerialInput): number {
    return input.readFloat16();
  }

  write(output: SerialOutput, value: number): void {
    output.writeFloat16(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(2);
  }
}

export const f16: Float16 = /* @__PURE__ */ new Float16Schema();

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

class Float32Schema implements Float32 {
  get maxSize(): 4 {
    return 4;
  }

  read(input: SerialInput): number {
    return input.readFloat32();
  }

  write(output: SerialOutput, value: number): void {
    output.writeFloat32(value);
  }

  measure(_: number | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(4);
  }
}

export const f32: Float32 = /* @__PURE__ */ new Float32Schema();
