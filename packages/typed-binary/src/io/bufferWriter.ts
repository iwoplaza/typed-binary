import { BufferIOBase } from './bufferIOBase';
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
    const result = this._textEncoder.encodeInto(
      value,
      this.uint8View.subarray(this.byteOffset),
    );
    this.byteOffset += result.written;

    // Extra null character
    this.uint8View[this.byteOffset++] = 0;
  }

  writeSlice(bufferView: ArrayLike<number> & ArrayBufferView): void {
    const unwrapped = unwrapBuffer(bufferView);

    const srcU8 = new Uint8Array(
      unwrapped.buffer,
      unwrapped.byteOffset,
      unwrapped.byteLength,
    );

    for (const srcByte of srcU8) {
      this.uint8View[this.byteOffset++] = srcByte;
    }
  }
}
