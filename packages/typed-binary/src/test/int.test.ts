import { describe, expect, it } from 'vitest';

import { i32, u32 } from '../describe';
import { encodeAndDecode } from './helpers/mock';
import { randIntBetween } from './random';

describe('Int32Schema', () => {
  it('should encode and decode an int value', () => {
    const value = randIntBetween(-100, 100);
    const decoded = encodeAndDecode(i32, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max pos int value', () => {
    const value = 2 ** 31 - 1;
    const decoded = encodeAndDecode(u32, value);

    expect(decoded).to.equal(value);
  });
});

describe('Uint32Schema', () => {
  it('should encode and decode an uint value', () => {
    const value = randIntBetween(0, 100);
    const decoded = encodeAndDecode(u32, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max uint value', () => {
    const value = 2 ** 32 - 1;
    const decoded = encodeAndDecode(u32, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into 0', () => {
    const decoded = encodeAndDecode(u32, 2 ** 32);

    expect(decoded).to.equal(0);
  });
});
