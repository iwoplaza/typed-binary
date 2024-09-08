import { describe, it, expect } from 'vitest';
import { i32Array, u32Array, u8Array } from '../describe';
import { encodeAndDecode } from './helpers/mock';

describe('u8Array', () => {
  it('encodes and decodes a uint8 array', () => {
    const value = new Uint8Array([0, 1, 15, 255]);

    expect([...encodeAndDecode(u8Array(4), value)]).toEqual([...value]);
  });

  it('encodes and decodes a uint32 array', () => {
    const value = new Uint32Array([0, 1, 15, 4_294_967_295]);

    expect([...encodeAndDecode(u32Array(4), value)]).toEqual([...value]);
  });

  it('encodes and decodes a int32 array', () => {
    const value = new Int32Array([0, 1, -2_147_483_648, 2_147_483_647]);

    expect([...encodeAndDecode(i32Array(4), value)]).toEqual([...value]);
  });
});
