import { describe, it, expect } from 'vitest';
import { u8Array } from '../describe';
import { encodeAndDecode } from './helpers/mock';

describe('u8Array', () => {
  it('encodes and decodes a uint8 array', () => {
    const schema = u8Array(4);

    const value = new Uint8Array([0, 1, 15, 255]);

    expect(encodeAndDecode(schema, value)).to.deep.equal(value);
  });
});
