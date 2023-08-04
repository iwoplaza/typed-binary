import { BufferIOBase, BufferIOOptions } from './bufferIOBase';
import { ISerialInput } from './types';

export class BufferReader extends BufferIOBase implements ISerialInput {
    constructor(buffer: ArrayBufferLike, options?: BufferIOOptions) {
        super(buffer, options);
    }

    readBool() {
        return this.uint8View[this.byteOffset++] !== 0;
    }

    readByte() {
        return this.uint8View[this.byteOffset++];
    }

    readFloat() {
        for (let i = 0; i < 4; ++i) {
            this.helperByteView[this.switchEndianness ? (3-i) : i] = this.uint8View[this.byteOffset++];
        }

        return this.helperFloatView[0];
    }

    readInt() {
        for (let i = 0; i < 4; ++i) {
            this.helperByteView[this.switchEndianness ? (3-i) : i] = this.uint8View[this.byteOffset++];
        }

        return this.helperIntView[0];
    }

    readString() {
        let contents = '';

        let char = String.fromCharCode(this.uint8View[this.byteOffset++]);
        while (char !== '\0') {
            contents += char;
            char = String.fromCharCode(this.uint8View[this.byteOffset++]);
        }

        return contents;
    }
}