import { describe, expect, it } from 'vitest';
import { unwrapBuffer } from './unwrapBuffer.ts';

describe('unwrapBuffer', () => {
  it('returns the input if given an array buffer', () => {
    const arrayBuffer = new ArrayBuffer(4 * 4);

    const result = unwrapBuffer(arrayBuffer);

    expect(result.byteOffset).toEqual(0);
    expect(result.buffer).toBe(arrayBuffer);
  });

  it('unwraps typed array and returns underlying buffer', () => {
    const arrayBuffer = new ArrayBuffer(4 * 4);
    const u32View = new Uint32Array(arrayBuffer);

    const result = unwrapBuffer(u32View);

    expect(result.byteOffset).toEqual(0);
    expect(result.buffer).toBe(arrayBuffer);
  });

  it('correctly calculates the offset that the view had on the buffer', () => {
    const arrayBuffer = new ArrayBuffer(4 * 4);
    const u32View = new Uint32Array(arrayBuffer, 4);

    const result = unwrapBuffer(u32View);

    expect(result.byteOffset).toEqual(4);
    expect(result.buffer).toBe(arrayBuffer);
  });
});
