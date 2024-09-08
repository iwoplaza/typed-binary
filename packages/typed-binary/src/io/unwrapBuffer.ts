/**
 * Removes up to one layer of view over a buffer.
 */
export function unwrapBuffer(buffer: ArrayBufferLike | ArrayBufferView) {
  let byteOffset = 0;
  let innerBuffer = buffer;

  if (!!innerBuffer && 'buffer' in innerBuffer && 'byteOffset' in innerBuffer) {
    // Getting rid of the outer shell, which allow us to create new views on the buffer instead of creating copies of it.
    byteOffset += innerBuffer.byteOffset;
    innerBuffer = innerBuffer.buffer;
  }

  return { buffer: innerBuffer, byteOffset };
}
