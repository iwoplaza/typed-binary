let systemEndianness: 'big' | 'little' | undefined;

// @__NO_SIDE_EFFECTS__
export function getSystemEndianness(): 'big' | 'little' {
  // The first byte of a 1 encoded as a 16-bit integer is 1 only on little-endian systems
  return (systemEndianness ??=
    new Uint8Array(new Uint16Array([1]).buffer)[0] === 1 ? 'little' : 'big');
}
