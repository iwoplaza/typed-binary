import { describe, expect, it } from 'vitest';

import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.chars', () => {
  it('should encode and decode fixed-size char arrays', () => {
    for (const value of ['', 'A', 'ABCXYZabcxyz0123456789']) {
      const description = bin.chars(value.length);
      expect(encodeAndDecode(description, value)).to.equal(value);
    }
  });
});
