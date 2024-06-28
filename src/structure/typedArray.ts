import {
  type ISerialInput,
  type ISerialOutput,
  type IMeasurer,
  Measurer,
} from '../io';
import { MutableBufferView } from '../io/types';
import { Parsed } from '../utilityTypes';
import { Schema, MaxValue } from './types';

type TypedArrayConstructor<T> = {
  readonly BYTES_PER_ELEMENT: number;
  new (buffer: ArrayBufferLike, offset?: number, length?: number): T;
};

export class TypedArraySchema<
  TTypedArray extends MutableBufferView,
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
