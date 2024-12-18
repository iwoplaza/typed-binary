import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import type { Parsed } from '../utilityTypes.ts';
import { type MaxValue, Schema } from './types.ts';

type TypedArrayConstructor<T> = {
  readonly BYTES_PER_ELEMENT: number;
  new (buffer: ArrayBufferLike, offset?: number, length?: number): T;
};

export class TypedArraySchema<
  TTypedArray extends ArrayLike<number> & ArrayBufferView,
> extends Schema<TTypedArray> {
  public readonly byteLength: number;

  constructor(
    public readonly length: number,
    private readonly _arrayConstructor: TypedArrayConstructor<TTypedArray>,
  ) {
    super();

    this.byteLength = length * _arrayConstructor.BYTES_PER_ELEMENT;
  }

  write(output: ISerialOutput, value: Parsed<TTypedArray>): void {
    output.writeSlice(value);
  }

  read(input: ISerialInput): Parsed<TTypedArray> {
    const buffer = new ArrayBuffer(this.byteLength);
    const view = new this._arrayConstructor(buffer, 0, this.length);
    input.readSlice(view, 0, this.byteLength);
    return view as Parsed<TTypedArray>;
  }

  measure(
    _value: Parsed<TTypedArray> | typeof MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return measurer.add(this.byteLength);
  }
}

export const u8Array = (length: number): TypedArraySchema<Uint8Array> =>
  new TypedArraySchema(length, Uint8Array);

export const u8ClampedArray = (
  length: number,
): TypedArraySchema<Uint8ClampedArray> =>
  new TypedArraySchema(length, Uint8ClampedArray);

export const u16Array = (length: number): TypedArraySchema<Uint16Array> =>
  new TypedArraySchema(length, Uint16Array);

export const u32Array = (length: number): TypedArraySchema<Uint32Array> =>
  new TypedArraySchema(length, Uint32Array);

export const i8Array = (length: number): TypedArraySchema<Int8Array> =>
  new TypedArraySchema(length, Int8Array);

export const i16Array = (length: number): TypedArraySchema<Int16Array> =>
  new TypedArraySchema(length, Int16Array);

export const i32Array = (length: number): TypedArraySchema<Int32Array> =>
  new TypedArraySchema(length, Int32Array);

export const f32Array = (length: number): TypedArraySchema<Float32Array> =>
  new TypedArraySchema(length, Float32Array);

export const f64Array = (length: number): TypedArraySchema<Float64Array> =>
  new TypedArraySchema(length, Float64Array);
