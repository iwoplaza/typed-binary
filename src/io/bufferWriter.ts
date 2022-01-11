import { isBigEndian } from '../util';
import { ISerialOutput } from './types';

export class BufferWriter implements ISerialOutput {
    private readonly uint8View: Uint8Array;
    private readonly helperIntView: Int32Array;
    private readonly helperFloatView: Float32Array;
    private readonly helperByteView: Uint8Array;
    private readonly switchEndianness: boolean;

    private byteOffset: number = 0;

    constructor(buffer: ArrayBuffer) {
        this.uint8View = new Uint8Array(buffer, 0);
        this.byteOffset = 0;

        let helperBuffer = new ArrayBuffer(4);
        this.helperIntView = new Int32Array(helperBuffer);
        this.helperFloatView = new Float32Array(helperBuffer);
        this.helperByteView = new Uint8Array(helperBuffer);

        // We want to ensure the output is big endian
        this.switchEndianness = !isBigEndian();
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
        this.byteOffset++;
    }

    get currentByteOffset() {
        return this.byteOffset;
    }
}
