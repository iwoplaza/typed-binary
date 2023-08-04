import { BufferIOBase, BufferIOOptions } from './bufferIOBase';
import { ISerialOutput } from './types';

export class BufferWriter extends BufferIOBase implements ISerialOutput {
    constructor(buffer: ArrayBufferLike, options?: BufferIOOptions) {
        super(buffer, options);
    }

    writeBool(value: boolean) {
        this.uint8View[this.byteOffset++] = value ? 1 : 0;
    }

    writeByte(value: number) {
        this.uint8View[this.byteOffset++] = Math.floor(value) % 256;
    }

    writeInt(value: number) {
        this.helperIntView[0] = Math.floor(value);

        for (let i = 0; i < 4; ++i)
            this.uint8View[this.byteOffset++] = this.helperByteView[this.switchEndianness ? (3-i) : i];
    }

    writeFloat(value: number) {
        this.helperFloatView[0] = value;

        for (let i = 0; i < 4; ++i)
            this.uint8View[this.byteOffset++] = this.helperByteView[this.switchEndianness ? (3-i) : i];
    }

    writeString(value: string) {
        for (let i = 0; i < value.length; ++i) {
            this.uint8View[this.byteOffset++] = value.charCodeAt(i);
        }

        // Extra null character
        this.uint8View[this.byteOffset++] = 0;
    }
}
