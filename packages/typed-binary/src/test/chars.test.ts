import { describe, expect, it } from 'vitest';

// Importing from the public API
import { CharsSchema } from '../index.ts';
// Helpers
import { encodeAndDecode } from './helpers/mock.ts';
import { randIntBetween } from './random.ts';

describe('CharsSchema', () => {
  it('should encode and decode fixed-size char array', () => {
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

    const description = new CharsSchema(value.length);
    expect(encodeAndDecode(description, value)).to.equal(value);
  });
});
