/**
 * @returns {Boolean} true if system is big endian
 */
function isSystemBigEndian(): boolean {
  const array = new Uint8Array(4);
  const view = new Uint32Array(array.buffer);

  return !((view[0] = 1) & array[0]);
}

export function getSystemEndianness() {
  return isSystemBigEndian() ? 'big' : 'little';
}
