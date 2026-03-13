import { BufferIOBase } from './bufferIOBase.ts';
import type { BufferView, ISerialInput } from './types.ts';
import { unwrapBuffer } from './unwrapBuffer.ts';

export class BufferReader extends BufferIOBase implements ISerialInput {
  private _cachedTextDecoder: TextDecoder | undefined;

  private get _textDecoder() {
    if (!this._cachedTextDecoder) {
      this._cachedTextDecoder = new TextDecoder(undefined, { fatal: true });
    }
    return this._cachedTextDecoder;
  }

  readBool(): boolean {
    return this.dataView.getUint8(this.byteOffset++) !== 0;
  }

  readByte(): number {
    return this.dataView.getUint8(this.byteOffset++);
  }

  readInt8(): number {
    return this.dataView.getInt8(this.byteOffset++);
  }

  readUint8(): number {
    return this.dataView.getUint8(this.byteOffset++);
  }

  readInt16(): number {
    const value = this.dataView.getInt16(this.byteOffset, this.littleEndian);
    this.byteOffset += 2;
    return value;
  }

  readUint16(): number {
    const value = this.dataView.getUint16(this.byteOffset, this.littleEndian);
    this.byteOffset += 2;
    return value;
  }

  readInt32(): number {
    const value = this.dataView.getInt32(this.byteOffset, this.littleEndian);
    this.byteOffset += 4;
    return value;
  }

  readUint32(): number {
    const value = this.dataView.getUint32(this.byteOffset, this.littleEndian);
    this.byteOffset += 4;
    return value;
  }

  readFloat16(): number {
    const value = this.dataView.getFloat16(this.byteOffset, this.littleEndian);
    this.byteOffset += 2;
    return value;
  }

  readFloat32(): number {
    const value = this.dataView.getFloat32(this.byteOffset, this.littleEndian);
    this.byteOffset += 4;
    return value;
  }

  readString(): string {
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

  readSlice(bufferView: BufferView, offset: number, byteLength: number): void {
    const unwrapped = unwrapBuffer(bufferView);
    const destU8 = new Uint8Array(unwrapped.buffer, unwrapped.byteOffset + offset);

    const bytesPerElement = bufferView.BYTES_PER_ELEMENT;

    if (this.needsByteSwap && bytesPerElement > 1) {
      for (let i = 0; i < byteLength; i += bytesPerElement) {
        for (let j = bytesPerElement - 1; j >= 0; j--) {
          destU8[i + j] = this.dataView.getUint8(this.byteOffset++);
        }
      }
    } else {
      destU8.set(new Uint8Array(this.dataView.buffer, this.byteOffset, byteLength));
      this.byteOffset += byteLength;
    }
  }
}
