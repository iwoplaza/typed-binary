import { BufferIOBase } from './bufferIOBase.ts';
import type { BufferView, ISerialOutput } from './types.ts';
import { unwrapBuffer } from './unwrapBuffer.ts';

export class BufferWriter extends BufferIOBase implements ISerialOutput {
  private _cachedTextEncoder: TextEncoder | undefined;

  private get _textEncoder() {
    if (!this._cachedTextEncoder) {
      this._cachedTextEncoder = new TextEncoder();
    }
    return this._cachedTextEncoder;
  }

  writeBool(value: boolean) {
    this.dataView.setUint8(this.byteOffset++, value ? 1 : 0);
  }

  writeByte(value: number) {
    this.dataView.setUint8(this.byteOffset++, value);
  }

  writeInt8(value: number) {
    this.dataView.setInt8(this.byteOffset++, value);
  }

  writeUint8(value: number) {
    this.dataView.setUint8(this.byteOffset++, value);
  }

  writeInt16(value: number) {
    this.dataView.setInt16(this.byteOffset, value, this.littleEndian);
    this.byteOffset += 2;
  }

  writeUint16(value: number) {
    this.dataView.setUint16(this.byteOffset, value, this.littleEndian);
    this.byteOffset += 2;
  }

  writeInt32(value: number) {
    this.dataView.setInt32(this.byteOffset, value, this.littleEndian);
    this.byteOffset += 4;
  }

  writeUint32(value: number) {
    this.dataView.setUint32(this.byteOffset, value, this.littleEndian);
    this.byteOffset += 4;
  }

  writeFloat16(value: number): void {
    this.dataView.setFloat16(this.byteOffset, value, this.littleEndian);
    this.byteOffset += 2;
  }

  writeFloat32(value: number) {
    this.dataView.setFloat32(this.byteOffset, value, this.littleEndian);
    this.byteOffset += 4;
  }

  writeString(value: string) {
    const result = this._textEncoder.encodeInto(
      value,
      new Uint8Array(this.dataView.buffer, this.byteOffset),
    );
    this.byteOffset += result.written;

    // Extra null character
    this.dataView.setUint8(this.byteOffset++, 0);
  }

  writeSlice(bufferView: BufferView): void {
    const unwrapped = unwrapBuffer(bufferView);
    const srcU8 = new Uint8Array(unwrapped.buffer, unwrapped.byteOffset, unwrapped.byteLength);

    const bytesPerElement = bufferView.BYTES_PER_ELEMENT;

    if (this.needsByteSwap && bytesPerElement > 1) {
      for (let i = 0; i < srcU8.length; i += bytesPerElement) {
        for (let j = bytesPerElement - 1; j >= 0; j--) {
          this.dataView.setUint8(this.byteOffset++, srcU8[i + j]);
        }
      }
    } else {
      new Uint8Array(this.dataView.buffer, this.byteOffset).set(srcU8);
      this.byteOffset += srcU8.length;
    }
  }
}
