import { describe, expect, it } from 'vitest';

// Importing from the public API
import { bool } from '../index.ts';
// Helpers
import { encodeAndDecode } from './helpers/mock.ts';

describe('BoolSchema', () => {
  it('should encode and decode a bool value', () => {
    const value = Math.random() < 0.5;
    const decoded = encodeAndDecode(bool, value);

    expect(decoded).to.equal(value);
  });
});
