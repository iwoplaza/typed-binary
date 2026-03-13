import { describe, expect, it } from 'vitest';

import bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';
import { randBetween } from './random.ts';

describe('Float32Schema', () => {
  it('should encode and decode a f32 value', () => {
    const value = randBetween(-100, 100);
    const decoded = encodeAndDecode(bin.f32, value);

    expect(decoded).toBeCloseTo(value, 0.01);
  });
});

describe('Float16Schema', () => {
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

    expect(decoded1).toBeCloseTo(value1, 0.0001);
    expect(decoded2).toBeCloseTo(value2, 0.0001);
    expect(decoded3).toBeCloseTo(value3, 0.0001);
    expect(decoded4).toBeCloseTo(value4, 0.0001);
    expect(decoded5).toBeCloseTo(value5, 0.0001);
    expect(decoded6).toBeCloseTo(value6, 0.0001);
    expect(decoded7).toBeCloseTo(value7, 0.0001);
    expect(decoded8).toBeCloseTo(value8, 0.0001);
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
    expect(decoded1).toBeCloseTo(value1, 4);
    expect(decoded2).toBeCloseTo(value2, 0.25);
    expect(decoded3).toBeCloseTo(value3, 0.000976);
    expect(decoded4).toBeCloseTo(value4, 16);
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
