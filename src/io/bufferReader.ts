import { BufferIOBase } from './bufferIOBase';
import type { ISerialInput } from './types';

export class BufferReader extends BufferIOBase implements ISerialInput {
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

  readFloat32() {
    this.copyInputToHelper(4);

    return this.helperFloatView[0];
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
    let contents = '';

    let char = String.fromCharCode(this.uint8View[this.byteOffset++]);
    while (char !== '\0') {
      contents += char;
      char = String.fromCharCode(this.uint8View[this.byteOffset++]);
    }

    return contents;
  }
}
