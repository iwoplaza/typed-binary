import { BufferIOBase, BufferIOOptions } from './bufferIOBase';
import { ISerialOutput } from './types';

export class BufferWriter extends BufferIOBase implements ISerialOutput {
  constructor(buffer: ArrayBufferLike, options?: BufferIOOptions) {
    super(buffer, options);
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
    for (let i = 0; i < value.length; ++i) {
      this.uint8View[this.byteOffset++] = value.charCodeAt(i);
    }

    // Extra null character
    this.uint8View[this.byteOffset++] = 0;
  }

  writeSlice(bufferView: ArrayLike<number> & ArrayBufferView): void {
    this.uint8View.set(bufferView, this.byteOffset);
    this.byteOffset += bufferView.byteLength;
  }
}
