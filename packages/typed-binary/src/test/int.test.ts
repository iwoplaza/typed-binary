import { describe, expect, it } from 'vitest';

import { i8, u8, i16, u16, i32, u32 } from '../describe';
import { encodeAndDecode } from './helpers/mock';
import { randIntBetween } from './random';

describe('Int8Schema', () => {
  it('should encode and decode a signed int8 value', () => {
    const value = randIntBetween(-128, 127);
    const decoded = encodeAndDecode(i8, value);

    expect(decoded).to.equal(value);
  });
});

describe('Uint8Schema', () => {
  it('should encode and decode a byte value', () => {
    const value = randIntBetween(0, 256);
    const decoded = encodeAndDecode(u8, value);

    expect(decoded).to.equal(value);
  });
});

describe('Int16Schema', () => {
  it('should encode and decode an int value', () => {
    const value = randIntBetween(-100, 100);
    const decoded = encodeAndDecode(i16, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max pos int value', () => {
    const value = 2 ** 15 - 1;
    const decoded = encodeAndDecode(i16, value);

    expect(decoded).to.equal(value);
  });
});

describe('Uint16Schema', () => {
  it('should encode and decode an uint16 value', () => {
    const value = randIntBetween(0, 100);
    const decoded = encodeAndDecode(u16, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max uint16 value', () => {
    const value = 2 ** 16 - 1;
    const decoded = encodeAndDecode(u16, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into 0', () => {
    const decoded = encodeAndDecode(u16, 2 ** 16);

    expect(decoded).to.equal(0);
  });
});

describe('Int32Schema', () => {
  it('should encode and decode an int value', () => {
    const value = randIntBetween(-100, 100);
    const decoded = encodeAndDecode(i32, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max pos int value', () => {
    const value = 2 ** 31 - 1;
    const decoded = encodeAndDecode(i32, value);

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
