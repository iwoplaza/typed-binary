import { describe, expect, it } from 'vitest';

import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.f32', () => {
  it('has a max size of 4 bytes', () => {
    expect(bin.f32.maxSize).toEqual(4);
  });

  it('should encode and decode exactly representable f32 values', () => {
    for (const value of [0, 1, -42.25, 100, 2 ** -20]) {
      expect(encodeAndDecode(bin.f32, value)).toEqual(value);
    }
  });

  it('should round f32 values to the nearest representable value', () => {
    for (const value of [0.1, -3.14159, 99.99]) {
      expect(encodeAndDecode(bin.f32, value)).toEqual(Math.fround(value));
    }
  });
});

describe('bin.f16', () => {
  it('should encode and decode a f16 value near or equal a power of 2 with high precision', () => {
    // near 2^-10
    const value1 = 0.000976;
    // near 2^-5
    const value2 = 0.031;
    //  2^-2
    const value3 = 0.25;
    //  2^0
    const value4 = 1;
    // 2^4
    const value5 = 16;
    // 2^8
    const value6 = 256;
    // 2^12
    const value7 = 4096;
    // 2^15 × (1 + 1023/1024) - largest representable value
    const value8 = 65504;

    const decoded1 = encodeAndDecode(bin.f16, value1);
    const decoded2 = encodeAndDecode(bin.f16, value2);
    const decoded3 = encodeAndDecode(bin.f16, value3);
    const decoded4 = encodeAndDecode(bin.f16, value4);
    const decoded5 = encodeAndDecode(bin.f16, value5);
    const decoded6 = encodeAndDecode(bin.f16, value6);
    const decoded7 = encodeAndDecode(bin.f16, value7);
    const decoded8 = encodeAndDecode(bin.f16, value8);

    expect(decoded1).to.closeTo(value1, 0.0001);
    expect(decoded2).to.closeTo(value2, 0.0001);
    expect(decoded3).to.closeTo(value3, 0.0001);
    expect(decoded4).to.closeTo(value4, 0.0001);
    expect(decoded5).to.closeTo(value5, 0.0001);
    expect(decoded6).to.closeTo(value6, 0.0001);
    expect(decoded7).to.closeTo(value7, 0.0001);
    expect(decoded8).to.closeTo(value8, 0.0001);
  });

  it('should encode and decode a f16 value', () => {
    const value1 = 5474; // precision should be 4
    const value2 = 145; // precision should be 2^-2
    const value3 = 0.34; // precision should be 2^-12
    const value4 = 21877.5; // precision should be 16

    const decoded1 = encodeAndDecode(bin.f16, value1);
    const decoded2 = encodeAndDecode(bin.f16, value2);
    const decoded3 = encodeAndDecode(bin.f16, value3);
    const decoded4 = encodeAndDecode(bin.f16, value4);

    // Nearest two representible numbers to 5474 are 5472 and 5476
    expect(Math.abs(decoded1 - value1)).toEqual(2);
    expect(decoded1).to.closeTo(value1, 4);
    expect(decoded2).to.closeTo(value2, 0.25);
    expect(decoded3).to.closeTo(value3, 0.000976);
    expect(decoded4).to.closeTo(value4, 16);
  });

  it('should handle NaN and Infinity', () => {
    const value1 = Number.POSITIVE_INFINITY;
    const value2 = Number.NEGATIVE_INFINITY;
    const value3 = Number.NaN;

    const decoded1 = encodeAndDecode(bin.f16, value1);
    const decoded2 = encodeAndDecode(bin.f16, value2);
    const decoded3 = encodeAndDecode(bin.f16, value3);

    expect(decoded1).toEqual(value1);
    expect(decoded2).toEqual(value2);
    expect(decoded3).toBeNaN();
  });
});
