export interface ISerialInput {
  readBool(): boolean;
  readByte(): number;
  readInt32(): number;
  readUint32(): number;
  readFloat32(): number;
  readString(): string;
  readonly currentByteOffset: number;
}

export interface ISerialOutput {
  writeBool(value: boolean): void;
  writeByte(value: number): void;
  writeInt32(value: number): void;
  writeUint32(value: number): void;
  writeFloat32(value: number): void;
  writeString(value: string): void;
  readonly currentByteOffset: number;
}
