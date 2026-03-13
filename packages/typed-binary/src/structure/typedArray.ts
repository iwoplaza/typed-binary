import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { type MaxValue, Schema } from './types.ts';

type TypedArrayConstructor<T> = {
  readonly BYTES_PER_ELEMENT: number;
  new (buffer: ArrayBufferLike, offset?: number, length?: number): T;
};

export class TypedArraySchema<
  TTypedArray extends ArrayLike<number> & ArrayBufferView,
> implements Schema<TTypedArray, TTypedArray> {
  declare readonly $in: TTypedArray;
  declare readonly $out: TTypedArray;

  readonly byteLength: number;
  readonly elementCount: number;

  readonly #arrayConstructor: TypedArrayConstructor<TTypedArray>;

  constructor(elementCount: number, arrayConstructor: TypedArrayConstructor<TTypedArray>) {
    this.elementCount = elementCount;
    this.byteLength = length * arrayConstructor.BYTES_PER_ELEMENT;
    this.#arrayConstructor = arrayConstructor;
  }

  write(output: ISerialOutput, value: TTypedArray): void {
    output.writeSlice(value);
  }

  read(input: ISerialInput): TTypedArray {
    const buffer = new ArrayBuffer(this.byteLength);
    const view = new this.#arrayConstructor(buffer, 0, this.elementCount);
    input.readSlice(view, 0, this.byteLength);
    return view;
  }

  measure(_value: TTypedArray | typeof MaxValue, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(this.byteLength);
  }
}

/*#__NO_SIDE_EFFECTS__*/
export const u8Array = (length: number): TypedArraySchema<Uint8Array> =>
  new TypedArraySchema(length, Uint8Array);

/*#__NO_SIDE_EFFECTS__*/
export const u8ClampedArray = (length: number): TypedArraySchema<Uint8ClampedArray> =>
  new TypedArraySchema(length, Uint8ClampedArray);

/*#__NO_SIDE_EFFECTS__*/
export const u16Array = (length: number): TypedArraySchema<Uint16Array> =>
  new TypedArraySchema(length, Uint16Array);

/*#__NO_SIDE_EFFECTS__*/
export const u32Array = (length: number): TypedArraySchema<Uint32Array> =>
  new TypedArraySchema(length, Uint32Array);

/*#__NO_SIDE_EFFECTS__*/
export const i8Array = (length: number): TypedArraySchema<Int8Array> =>
  new TypedArraySchema(length, Int8Array);

/*#__NO_SIDE_EFFECTS__*/
export const i16Array = (length: number): TypedArraySchema<Int16Array> =>
  new TypedArraySchema(length, Int16Array);

/*#__NO_SIDE_EFFECTS__*/
export const i32Array = (length: number): TypedArraySchema<Int32Array> =>
  new TypedArraySchema(length, Int32Array);

/*#__NO_SIDE_EFFECTS__*/
export const f32Array = (length: number): TypedArraySchema<Float32Array> =>
  new TypedArraySchema(length, Float32Array);

/*#__NO_SIDE_EFFECTS__*/
export const f64Array = (length: number): TypedArraySchema<Float64Array> =>
  new TypedArraySchema(length, Float64Array);
