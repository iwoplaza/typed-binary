/**
 * @returns {Boolean} true if system is big endian
 */
// @__NO_SIDE_EFFECTS__
function isSystemBigEndian(): boolean {
  const array = new Uint8Array(4);
  const view = new Uint32Array(array.buffer);

  view[0] = 1; // setting a one spanning 4 bytes

  return array[0] === 0; // if zero is the left-most byte, one was encoded as big endian
}

// @__NO_SIDE_EFFECTS__
export function getSystemEndianness(): 'big' | 'little' {
  return isSystemBigEndian() ? 'big' : 'little';
}
