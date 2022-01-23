import { isBigEndian } from '../util';
import { ISerialInput } from './types';

export class BufferReader implements ISerialInput {
    private readonly uint8View: Uint8Array;
    private readonly helperIntView: Int32Array;
    private readonly helperFloatView: Float32Array;
    private readonly helperByteView: Uint8Array;
    private readonly switchEndianness: boolean;

    private byteOffset: number = 0;

    constructor(buffer: Buffer) {
        this.uint8View = new Uint8Array(buffer, 0);
        this.byteOffset = 0;
        
        let helperBuffer = new ArrayBuffer(4);
        this.helperIntView = new Int32Array(helperBuffer);
        this.helperFloatView = new Float32Array(helperBuffer);
        this.helperByteView = new Uint8Array(helperBuffer);
        
        // We want to ensure the output is big endian
        this.switchEndianness = !isBigEndian();
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

    get currentByteOffset() {
        return this.byteOffset;
    }
}