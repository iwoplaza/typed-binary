import { describe, expect, it } from 'vitest';

import { byte } from '../describe';
import { encodeAndDecode } from './helpers/mock';
import { randIntBetween } from './random';

describe('ByteSchema', () => {
  it('should encode and decode a byte value', () => {
    const value = randIntBetween(0, 256);
    const decoded = encodeAndDecode(byte, value);

    expect(decoded).to.equal(value);
  });
});
