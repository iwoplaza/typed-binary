import { describe, expect, it } from 'vitest';

import { f16, f32 } from '../describe';
import { encodeAndDecode } from './helpers/mock';
import { randBetween } from './random';

describe('Float32Schema', () => {
  it('should encode and decode a f32 value', () => {
    const value = randBetween(-100, 100);
    const decoded = encodeAndDecode(f32, value);

    expect(decoded).to.closeTo(value, 0.01);
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

    const decoded1 = encodeAndDecode(f16, value1);
    const decoded2 = encodeAndDecode(f16, value2);
    const decoded3 = encodeAndDecode(f16, value3);
    const decoded4 = encodeAndDecode(f16, value4);
    const decoded5 = encodeAndDecode(f16, value5);
    const decoded6 = encodeAndDecode(f16, value6);
    const decoded7 = encodeAndDecode(f16, value7);
    const decoded8 = encodeAndDecode(f16, value8);

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
    const value1 = 5472.5; // precision should be 4
    const value2 = 145; // precision should be 2^-2
    const value3 = 0.34; // precision should be 2^-12
    const value4 = 21877.5; // precision should be 16

    const decoded1 = encodeAndDecode(f16, value1);
    const decoded2 = encodeAndDecode(f16, value2);
    const decoded3 = encodeAndDecode(f16, value3);
    const decoded4 = encodeAndDecode(f16, value4);

    expect(decoded1).to.closeTo(value1, 4);
    expect(decoded2).to.closeTo(value2, 0.25);
    expect(decoded3).to.closeTo(value3, 0.000976);
    expect(decoded4).to.closeTo(value4, 16);
  });
});
