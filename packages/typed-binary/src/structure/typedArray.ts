import type { ByteCursor } from '../io/cursor.ts';
import { Measurer } from '../io/measurer.ts';
import type { BufferView } from '../io/types.ts';
import { unwrapBuffer } from '../io/unwrapBuffer.ts';
import { getSystemEndianness } from '../util.ts';
import type { MaxValue, Schema } from './types.ts';

type TypedArrayConstructor<T> = {
  readonly BYTES_PER_ELEMENT: number;
  new (buffer: ArrayBufferLike, offset?: number, length?: number): T;
};

export interface TypedArray<TTypedArray extends BufferView> extends Schema<TTypedArray> {
  readonly byteLength: number;
  readonly elementCount: number;
}

function needsByteSwap(cursor: ByteCursor): boolean {
  return cursor.littleEndian !== (getSystemEndianness() === 'little');
}

class TypedArrayImpl<TTypedArray extends BufferView> implements TypedArray<TTypedArray> {
  readonly byteLength: number;
  readonly elementCount: number;

  readonly #arrayConstructor: TypedArrayConstructor<TTypedArray>;

  constructor(elementCount: number, arrayConstructor: TypedArrayConstructor<TTypedArray>) {
    this.elementCount = elementCount;
    this.byteLength = elementCount * arrayConstructor.BYTES_PER_ELEMENT;
    this.#arrayConstructor = arrayConstructor;
  }

  write(cursor: ByteCursor, value: TTypedArray): void {
    const { view } = cursor;
    const unwrapped = unwrapBuffer(value);
    const srcU8 = new Uint8Array(unwrapped.buffer, unwrapped.byteOffset, unwrapped.byteLength);
    const bytesPerElement = value.BYTES_PER_ELEMENT;

    if (bytesPerElement > 1 && needsByteSwap(cursor)) {
      for (let i = 0; i < srcU8.length; i += bytesPerElement) {
        for (let j = bytesPerElement - 1; j >= 0; j--) {
          view.setUint8(cursor.offset++, srcU8[i + j]);
        }
      }
    } else {
      new Uint8Array(view.buffer, view.byteOffset + cursor.offset, srcU8.length).set(srcU8);
      cursor.offset += srcU8.length;
    }
  }

  read(cursor: ByteCursor): TTypedArray {
    const { view } = cursor;
    const buffer = new ArrayBuffer(this.byteLength);
    const destU8 = new Uint8Array(buffer);
    const bytesPerElement = this.#arrayConstructor.BYTES_PER_ELEMENT;

    if (bytesPerElement > 1 && needsByteSwap(cursor)) {
      for (let i = 0; i < this.byteLength; i += bytesPerElement) {
        for (let j = bytesPerElement - 1; j >= 0; j--) {
          destU8[i + j] = view.getUint8(cursor.offset++);
        }
      }
    } else {
      destU8.set(new Uint8Array(view.buffer, view.byteOffset + cursor.offset, this.byteLength));
      cursor.offset += this.byteLength;
    }

    return new this.#arrayConstructor(buffer, 0, this.elementCount);
  }

  measure(_value: TTypedArray | typeof MaxValue, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(this.byteLength);
  }
}

/*#__NO_SIDE_EFFECTS__*/
export const u8Array = (length: number): TypedArray<Uint8Array> =>
  new TypedArrayImpl(length, Uint8Array);

/*#__NO_SIDE_EFFECTS__*/
export const u8ClampedArray = (length: number): TypedArray<Uint8ClampedArray> =>
  new TypedArrayImpl(length, Uint8ClampedArray);

/*#__NO_SIDE_EFFECTS__*/
export const u16Array = (length: number): TypedArray<Uint16Array> =>
  new TypedArrayImpl(length, Uint16Array);

/*#__NO_SIDE_EFFECTS__*/
export const u32Array = (length: number): TypedArray<Uint32Array> =>
  new TypedArrayImpl(length, Uint32Array);

/*#__NO_SIDE_EFFECTS__*/
export const i8Array = (length: number): TypedArray<Int8Array> =>
  new TypedArrayImpl(length, Int8Array);

/*#__NO_SIDE_EFFECTS__*/
export const i16Array = (length: number): TypedArray<Int16Array> =>
  new TypedArrayImpl(length, Int16Array);

/*#__NO_SIDE_EFFECTS__*/
export const i32Array = (length: number): TypedArray<Int32Array> =>
  new TypedArrayImpl(length, Int32Array);

/*#__NO_SIDE_EFFECTS__*/
export const f32Array = (length: number): TypedArray<Float32Array> =>
  new TypedArrayImpl(length, Float32Array);

/*#__NO_SIDE_EFFECTS__*/
export const f64Array = (length: number): TypedArray<Float64Array> =>
  new TypedArrayImpl(length, Float64Array);
