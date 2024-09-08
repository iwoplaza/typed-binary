export type Endianness = 'big' | 'little';

export type ImmutableBufferView = ArrayLike<number> & ArrayBufferView;

export type MutableBufferView = ImmutableBufferView & {
  set(array: ArrayLike<number>, offset?: number): void;
};

export interface ISerialInput {
  readBool(): boolean;
  readByte(): number;
  readInt32(): number;
  readUint32(): number;
  readFloat32(): number;
  readString(): string;
  readSlice(
    bufferView: MutableBufferView,
    offset: number,
    byteLength: number,
  ): void;
  seekTo(offset: number): void;
  skipBytes(bytes: number): void;
  readonly endianness: Endianness;
  readonly currentByteOffset: number;
}

export interface ISerialOutput {
  writeBool(value: boolean): void;
  writeByte(value: number): void;
  writeInt32(value: number): void;
  writeUint32(value: number): void;
  writeFloat32(value: number): void;
  writeString(value: string): void;
  writeSlice(bufferView: ImmutableBufferView): void;
  seekTo(offset: number): void;
  skipBytes(bytes: number): void;
  readonly endianness: Endianness;
  readonly currentByteOffset: number;
}

export interface IMeasurer {
  add(bytes: number): IMeasurer;
  fork(): IMeasurer;
  readonly unbounded: IMeasurer;

  readonly size: number;
  readonly isUnbounded: boolean;
}
