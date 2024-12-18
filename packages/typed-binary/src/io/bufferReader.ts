import { BufferIOBase } from './bufferIOBase.ts';
import { float16ToNumber } from './float16converter.ts';
import type { ISerialInput } from './types.ts';
import { unwrapBuffer } from './unwrapBuffer.ts';

export class BufferReader extends BufferIOBase implements ISerialInput {
  private _cachedTextDecoder: TextDecoder | undefined;

  private get _textDecoder() {
    if (!this._cachedTextDecoder) {
      this._cachedTextDecoder = new TextDecoder(undefined, { fatal: true });
    }
    return this._cachedTextDecoder;
  }

  readBool() {
    return this.dataView.getUint8(this.byteOffset++) !== 0;
  }

  readByte() {
    return this.dataView.getUint8(this.byteOffset++);
  }

  readInt8() {
    return this.dataView.getInt8(this.byteOffset++);
  }

  readUint8() {
    return this.dataView.getUint8(this.byteOffset++);
  }

  readInt16() {
    const value = this.dataView.getInt16(this.byteOffset, this.littleEndian);
    this.byteOffset += 2;
    return value;
  }

  readUint16() {
    const value = this.dataView.getUint16(this.byteOffset, this.littleEndian);
    this.byteOffset += 2;
    return value;
  }

  readInt32() {
    const value = this.dataView.getInt32(this.byteOffset, this.littleEndian);
    this.byteOffset += 4;
    return value;
  }

  readUint32() {
    const value = this.dataView.getUint32(this.byteOffset, this.littleEndian);
    this.byteOffset += 4;
    return value;
  }

  readFloat16() {
    const value = this.dataView.getUint16(this.byteOffset, this.littleEndian);
    this.byteOffset += 2;
    return float16ToNumber(value);
  }

  readFloat32() {
    const value = this.dataView.getFloat32(this.byteOffset, this.littleEndian);
    this.byteOffset += 4;
    return value;
  }

  readString() {
    // Looking for the 'NULL' byte.
    let strLength = 0;
    while (this.byteOffset + strLength < this.dataView.byteLength) {
      if (this.dataView.getUint8(this.byteOffset + strLength++) === 0) {
        break;
      }
    }

    const result = this._textDecoder.decode(
      new Uint8Array(this.dataView.buffer, this.byteOffset, strLength - 1),
    );

    this.byteOffset += strLength;

    return result;
  }

  readSlice(
    bufferView: ArrayLike<number> & ArrayBufferView,
    offset: number,
    byteLength: number,
  ): void {
    const unwrapped = unwrapBuffer(bufferView);
    const destU8 = new Uint8Array(
      unwrapped.buffer,
      unwrapped.byteOffset + offset,
    );

    for (let i = 0; i < byteLength; ++i) {
      destU8[i] = this.dataView.getUint8(this.byteOffset++);
    }
  }
}
