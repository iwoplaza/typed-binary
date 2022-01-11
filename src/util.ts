/**
 * @returns {Boolean} true if system is big endian
 */
 export function isBigEndian(): boolean {
    const array = new Uint8Array(4);
    const view = new Uint32Array(array.buffer);

    return !((view[0] = 1) & array[0]);
}