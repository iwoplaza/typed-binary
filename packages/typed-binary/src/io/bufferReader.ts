import { BufferIOBase } from './bufferIOBase';
import { float16ToNumber } from './float16converter';
import type { ISerialInput } from './types';
import { unwrapBuffer } from './unwrapBuffer';

export class BufferReader extends BufferIOBase implements ISerialInput {
  private _cachedTextDecoder: TextDecoder | undefined;

  private get _textDecoder() {
    if (!this._cachedTextDecoder) {
      this._cachedTextDecoder = new TextDecoder(undefined, { fatal: true });
    }
    return this._cachedTextDecoder;
  }

  private copyInputToHelper(bytes: number) {
    for (let i = 0; i < bytes; ++i) {
      this.helperByteView[this.switchEndianness ? bytes - 1 - i : i] =
        this.uint8View[this.byteOffset++];
    }
  }

  readBool() {
    return this.uint8View[this.byteOffset++] !== 0;
  }

  readByte() {
    return this.uint8View[this.byteOffset++];
  }

  readFloat16() {
    this.copyInputToHelper(2);

    return float16ToNumber(this.helperUint16View);
  }

  readFloat32() {
    this.copyInputToHelper(4);

    return this.helperFloat32View[0];
  }

  readInt32() {
    this.copyInputToHelper(4);

    return this.helperInt32View[0];
  }

  readUint32() {
    this.copyInputToHelper(4);

    return this.helperUint32View[0];
  }

  readString() {
    // Looking for the 'NULL' byte.
    let end = this.byteOffset;
    while (end < this.uint8View.byteLength) {
      if (this.uint8View[end++] === 0) {
        break;
      }
    }

    const result = this._textDecoder.decode(
      this.uint8View.subarray(this.byteOffset, end - 1),
    );

    this.byteOffset = end;

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
      destU8[i] = this.uint8View[this.byteOffset++];
    }
  }
}
