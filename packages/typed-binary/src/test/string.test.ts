import { describe, expect, it } from 'vitest';

// Importing from the public API
import bin from '../index.ts';
// Helpers
import { encodeAndDecode } from './helpers/mock.ts';
import { randIntBetween } from './random.ts';

describe('StringSchema', () => {
  it('should encode and decode an empty string value', () => {
    const decoded = encodeAndDecode(bin.string, '');

    expect(decoded).to.equal('');
  });

  it('should encode and decode an alphanumerical string', () => {
    const length = randIntBetween(0, 100);
    let value = '';
    const ranges = [
      ['A', 'Z'],
      ['a', 'z'],
      ['0', '9'],
    ];
    for (let i = 0; i < length; ++i) {
      const range = ranges[randIntBetween(0, ranges.length) % ranges.length];
      value += String.fromCharCode(
        randIntBetween(range[0].charCodeAt(0), range[1].charCodeAt(0)),
      );
    }

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
