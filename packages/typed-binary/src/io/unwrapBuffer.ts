interface UnwrapBufferResult {
  buffer: ArrayBufferLike;
  byteOffset: number;
  byteLength: number;
}

/**
 * Removes up to one layer of view over a buffer.
 */
// @__NO_SIDE_EFFECTS__
export function unwrapBuffer(
  buffer: ArrayBufferLike | ArrayBufferView,
): UnwrapBufferResult {
  let byteOffset = 0;
  let innerBuffer = buffer;

  if (!!innerBuffer && 'buffer' in innerBuffer && 'byteOffset' in innerBuffer) {
    // Getting rid of the outer shell, which allow us to create new views on the buffer instead of creating copies of it.
    byteOffset += innerBuffer.byteOffset;
    innerBuffer = innerBuffer.buffer;
  }

  return { buffer: innerBuffer, byteOffset, byteLength: buffer.byteLength };
}
