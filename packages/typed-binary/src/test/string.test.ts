import { describe, expect, it } from 'vitest';

// Importing from the public API
import * as bin from '../index.ts';
// Helpers
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.string', () => {
  it('has an unbounded max size', () => {
    expect(bin.string.maxSize).toBeNaN();
  });

  it('should encode and decode an empty string value', () => {
    const decoded = encodeAndDecode(bin.string, '');

    expect(decoded).to.equal('');
  });

  it('should encode and decode an alphanumerical string', () => {
    const value = 'ABCXYZabcxyz0123456789';
    const decoded = encodeAndDecode(bin.string, value);
    expect(decoded).to.equal(value);
  });

  it('should encode an emoji', () => {
    const value = '⛓️‍💥';
    const decoded = encodeAndDecode(bin.string, value);
    expect(decoded).to.equal(value);
  });

  it('should encode a unicode string', () => {
    const value = 'A wonderful 🌞 sunny day! 🌲🌲🌲 Forest trip.';
    const decoded = encodeAndDecode(bin.string, value);
    expect(decoded).to.equal(value);
  });
});
