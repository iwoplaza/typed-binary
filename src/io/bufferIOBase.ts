import { getSystemEndianness } from '../util';
import { Endianness } from './types';

export type BufferIOOptions = {
  /**
   * @default 0
   */
  byteOffset: number;
  /**
   * @default 'system'
   */
  endianness: Endianness | 'system';
};

export class BufferIOBase {
  protected readonly uint8View: Uint8Array;
  protected readonly helperInt32View: Int32Array;
  protected readonly helperUint32View: Uint32Array;
  protected readonly helperFloatView: Float32Array;
  protected readonly helperByteView: Uint8Array;
  protected readonly switchEndianness: boolean;

  protected byteOffset = 0;

  public readonly endianness: Endianness;

  constructor(buffer: ArrayBufferLike, options?: BufferIOOptions) {
    this.byteOffset = options?.byteOffset ?? 0;

    if (typeof Buffer !== 'undefined' && buffer instanceof Buffer) {
      // Getting rid of the outer shell, which causes the Uint8Array line to create a copy, instead of a view.
      this.byteOffset += buffer.byteOffset;
      buffer = buffer.buffer;
    }

    this.uint8View = new Uint8Array(buffer, 0);

    const helperBuffer = new ArrayBuffer(4);
    this.helperInt32View = new Int32Array(helperBuffer);
    this.helperUint32View = new Uint32Array(helperBuffer);
    this.helperFloatView = new Float32Array(helperBuffer);
    this.helperByteView = new Uint8Array(helperBuffer);

    const systemEndianness = getSystemEndianness();

    this.endianness =
      !options || options.endianness === 'system'
        ? systemEndianness
        : options.endianness;

    this.switchEndianness = this.endianness !== systemEndianness;
  }

  get currentByteOffset() {
    return this.byteOffset;
  }

  seekTo(offset: number): void {
    this.byteOffset = offset;
  }

  skipBytes(bytes: number): void {
    this.byteOffset += bytes;
  }
}
