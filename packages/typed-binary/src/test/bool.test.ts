import { describe, expect, it } from 'vitest';

import { bool } from '../structure';
import { encodeAndDecode } from './helpers/mock';

describe('BoolSchema', () => {
  it('should encode and decode a bool value', () => {
    const value = Math.random() < 0.5;
    const decoded = encodeAndDecode(bool, value);

    expect(decoded).to.equal(value);
  });
});
