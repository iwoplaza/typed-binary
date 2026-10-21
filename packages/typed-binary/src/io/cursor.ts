import { getSystemEndianness } from '../util.ts';
import type { Endianness } from './types.ts';

/**
 * A position in a buffer that schemas read from and write to. A plain object, so it can
 * also be created by hand, e.g. `{ view: new DataView(buffer), offset: 0, littleEndian: true }`.
 */
export interface ByteCursor {
  readonly view: DataView;
  /**
   * The byte offset of the next read or write, relative to the start of `view`.
   * Can be reassigned to seek, or incremented to skip bytes.
   */
  offset: number;
  readonly littleEndian: boolean;
}

export type CursorOptions = {
  /**
   * @default 0
   */
  byteOffset?: number;
  /**
   * @default 'system'
   */
  endianness?: Endianness | 'system';
};

/**
 * Creates a cursor over a buffer, or over a view of it (e.g. a typed array or a Node.js `Buffer`).
 * Offsets are relative to the start of the given view.
 */
// @__NO_SIDE_EFFECTS__
export function cursor(
  buffer: ArrayBufferLike | ArrayBufferView,
  options?: CursorOptions,
): ByteCursor {
  const { byteOffset = 0, endianness = 'system' } = options ?? {};

  return {
    view: ArrayBuffer.isView(buffer)
      ? new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      : // Without an explicit length, the view follows the size of a resizable buffer
        new DataView(buffer),
    offset: byteOffset,
    littleEndian: (endianness === 'system' ? getSystemEndianness() : endianness) === 'little',
  };
}
