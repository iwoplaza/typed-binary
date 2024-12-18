import { getSystemEndianness } from '../util.ts';
import type { Endianness } from './types.ts';
import { unwrapBuffer } from './unwrapBuffer.ts';

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
  protected readonly dataView: DataView;
  protected readonly littleEndian: boolean;
  protected byteOffset = 0;

  public readonly endianness: Endianness;

  constructor(buffer: ArrayBufferLike, options?: BufferIOOptions) {
    const { byteOffset = 0, endianness = 'system' } = options ?? {};

    this.byteOffset = byteOffset;

    const systemEndianness = getSystemEndianness();
    this.endianness = endianness === 'system' ? systemEndianness : endianness;
    this.littleEndian = this.endianness === 'little';

    // Getting rid of the outer shell, which causes the Uint8Array line to create a copy, instead of a view.
    const unwrapped = unwrapBuffer(buffer);
    this.byteOffset += unwrapped.byteOffset;

    this.dataView = new DataView(unwrapped.buffer);
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
