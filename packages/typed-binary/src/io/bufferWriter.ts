import { BufferIOBase } from './bufferIOBase';
import { numberToFloat16 } from './float16converter';
import type { ISerialOutput } from './types';
import { unwrapBuffer } from './unwrapBuffer';

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
    this.dataView.setUint16(
      this.byteOffset,
      numberToFloat16(value),
      this.littleEndian,
    );
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

  writeSlice(bufferView: ArrayLike<number> & ArrayBufferView): void {
    const unwrapped = unwrapBuffer(bufferView);

    const srcU8 = new Uint8Array(
      unwrapped.buffer,
      unwrapped.byteOffset,
      unwrapped.byteLength,
    );

    for (const srcByte of srcU8) {
      this.dataView.setUint8(this.byteOffset++, srcByte);
    }
  }
}
