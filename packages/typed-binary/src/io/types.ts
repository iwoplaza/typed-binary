export type Endianness = 'big' | 'little';

export type BufferView = ArrayLike<number> & ArrayBufferView;

export interface ISerialInput {
  readBool(): boolean;
  /**
   * @deprecated Use `readUint8` instead.
   */
  readByte(): number;
  readInt8(): number;
  readUint8(): number;
  readInt16(): number;
  readUint16(): number;
  readInt32(): number;
  readUint32(): number;
  readFloat16(): number;
  readFloat32(): number;
  readString(): string;
  readSlice(bufferView: BufferView, offset: number, byteLength: number): void;
  seekTo(offset: number): void;
  skipBytes(bytes: number): void;
  readonly endianness: Endianness;
  readonly currentByteOffset: number;
}

export interface ISerialOutput {
  writeBool(value: boolean): void;
  /**
   * @deprecated Use `writeUint8` instead.
   */
  writeByte(value: number): void;
  writeInt8(value: number): void;
  writeUint8(value: number): void;
  writeInt16(value: number): void;
  writeUint16(value: number): void;
  writeInt32(value: number): void;
  writeUint32(value: number): void;
  writeFloat16(value: number): void;
  writeFloat32(value: number): void;
  writeString(value: string): void;
  writeSlice(bufferView: BufferView): void;
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
