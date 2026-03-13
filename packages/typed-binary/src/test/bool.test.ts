import { describe, expect, it } from 'vitest';
import bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.bool', () => {
  it('should encode and decode a bool value', () => {
    const value = Math.random() < 0.5;
    const decoded = encodeAndDecode(bin.bool, value);

    expect(decoded).to.equal(value);
  });
});
