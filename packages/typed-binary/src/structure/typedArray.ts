import { Measurer } from '../io/measurer.ts';
import type { BufferView, SerialInput, SerialOutput } from '../io/types.ts';
import type { MaxValue, Schema } from './types.ts';

type TypedArrayConstructor<T> = {
  readonly BYTES_PER_ELEMENT: number;
  new (buffer: ArrayBufferLike, offset?: number, length?: number): T;
};

export interface TypedArray<TTypedArray extends BufferView> extends Schema<TTypedArray> {
  readonly byteLength: number;
  readonly elementCount: number;
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

  write(output: SerialOutput, value: TTypedArray): void {
    output.writeSlice(value);
  }

  read(input: SerialInput): TTypedArray {
    const buffer = new ArrayBuffer(this.byteLength);
    const view = new this.#arrayConstructor(buffer, 0, this.elementCount);
    input.readSlice(view, 0, this.byteLength);
    return view;
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
