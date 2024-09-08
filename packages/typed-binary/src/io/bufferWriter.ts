import { BufferIOBase } from './bufferIOBase';
import type { ISerialOutput } from './types';
import { unwrapBuffer } from './unwrapBuffer';

export class BufferWriter extends BufferIOBase implements ISerialOutput {
  private copyHelperToOutput(bytes: number) {
    for (let i = 0; i < bytes; ++i)
      this.uint8View[this.byteOffset++] =
        this.helperByteView[this.switchEndianness ? bytes - 1 - i : i];
  }

  writeBool(value: boolean) {
    this.uint8View[this.byteOffset++] = value ? 1 : 0;
  }

  writeByte(value: number) {
    this.uint8View[this.byteOffset++] = Math.floor(value) % 256;
  }

  writeInt32(value: number) {
    this.helperInt32View[0] = Math.floor(value);

    this.copyHelperToOutput(4);
  }

  writeUint32(value: number) {
    this.helperUint32View[0] = Math.floor(value);

    this.copyHelperToOutput(4);
  }

  writeFloat32(value: number) {
    this.helperFloatView[0] = value;

    this.copyHelperToOutput(4);
  }

  writeString(value: string) {
    for (let i = 0; i < value.length; ++i) {
      this.uint8View[this.byteOffset++] = value.charCodeAt(i);
    }

    // Extra null character
    this.uint8View[this.byteOffset++] = 0;
  }

  writeSlice(bufferView: ArrayLike<number> & ArrayBufferView): void {
    const srcBuffer = unwrapBuffer(bufferView);
    const srcU8 = new Uint8Array(srcBuffer.buffer, srcBuffer.byteOffset);
    for (const srcByte of srcU8) {
      this.uint8View[this.byteOffset++] = srcByte;
    }
  }
}
