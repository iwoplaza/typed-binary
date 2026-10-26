import { describe, expect, it } from 'vitest';
import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.bool', () => {
  it('should encode and decode bool values', () => {
    expect(encodeAndDecode(bin.bool, true)).to.equal(true);
    expect(encodeAndDecode(bin.bool, false)).to.equal(false);
  });
});
