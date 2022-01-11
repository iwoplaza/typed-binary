export interface ISerialInput {
    readBool(): boolean;
    readByte(): number;
    readInt(): number;
    readFloat(): number;
    readString(): string;
    readonly currentByteOffset: number;
}

export interface ISerialOutput {
    writeBool(value: boolean): void;
    writeByte(value: number): void;
    writeInt(value: number): void;
    writeFloat(value: number): void;
    writeString(value: string): void;
    readonly currentByteOffset: number;
}