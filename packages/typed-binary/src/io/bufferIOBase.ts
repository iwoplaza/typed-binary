import { getSystemEndianness } from '../util';
import type { Endianness } from './types';
import { unwrapBuffer } from './unwrapBuffer';

export type BufferIOOptions = {
  /**
   * @default 0
   */
  byteOffset?: number;
  /**
   * @default 'system'
   */
  endianness?: Endianness | 'system';
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
    const { byteOffset = 0, endianness = 'system' } = options ?? {};

    this.byteOffset = byteOffset;

    const systemEndianness = getSystemEndianness();
    this.endianness = endianness === 'system' ? systemEndianness : endianness;
    this.switchEndianness = this.endianness !== systemEndianness;

    // Getting rid of the outer shell, which causes the Uint8Array line to create a copy, instead of a view.
    const unwrapped = unwrapBuffer(buffer);
    this.byteOffset += unwrapped.byteOffset;

    this.uint8View = new Uint8Array(unwrapped.buffer, 0);

    const helperBuffer = new ArrayBuffer(4);
    this.helperInt32View = new Int32Array(helperBuffer);
    this.helperUint32View = new Uint32Array(helperBuffer);
    this.helperFloatView = new Float32Array(helperBuffer);
    this.helperByteView = new Uint8Array(helperBuffer);
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
