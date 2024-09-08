import { describe, it, expect } from 'vitest';
import {
  f32Array,
  f64Array,
  i16Array,
  i32Array,
  i8Array,
  u16Array,
  u32Array,
  u8Array,
  u8ClampedArray,
} from '../describe';
import { encodeAndDecode } from './helpers/mock';

describe('u8Array', () => {
  it('encodes and decodes a uint8 array', () => {
    const value = new Uint8Array([0, 1, 15, 255, 256]);

    expect(value[4]).toEqual(0); // not-clamping
    expect([...encodeAndDecode(u8Array(5), value)]).toEqual([...value]);
  });
});

describe('u8ClampedArray', () => {
  it('encodes and decodes a clamped uint8 array', () => {
    const value = new Uint8ClampedArray([0, 1, 15, 255, 256]);

    expect(value[4]).toEqual(255); // clamping
    expect([...encodeAndDecode(u8ClampedArray(5), value)]).toEqual([...value]);
  });
});

describe('u16Array', () => {
  it('encodes and decodes a uint16 array', () => {
    const value = new Uint16Array([0, 1, 15, 65_535, 65_536]);

    expect(value[3]).toEqual(65_535);
    expect(value[4]).toEqual(0); // not-clamping
    expect([...encodeAndDecode(u16Array(5), value)]).toEqual([...value]);
  });
});

describe('u32Array', () => {
  it('encodes and decodes a uint32 array', () => {
    const value = new Uint32Array([0, 1, 15, 4_294_967_295, 4_294_967_296]);

    expect(value[3]).toEqual(4_294_967_295);
    expect(value[4]).toEqual(0); // not-clamping
    expect([...encodeAndDecode(u32Array(5), value)]).toEqual([...value]);
  });
});

describe('i8Array', () => {
  it('encodes and decodes a int8 array', () => {
    const value = new Int8Array([0, 1, 15, 127, 128]);

    expect(value[3]).toEqual(127);
    expect(value[4]).toEqual(-128); // one-over max interpreted as negative
    expect([...encodeAndDecode(i8Array(5), value)]).toEqual([...value]);
  });
});

describe('i16Array', () => {
  it('encodes and decodes a int16 array', () => {
    const value = new Int16Array([0, 1, 15, 32_767, 32_768]);

    expect(value[3]).toEqual(32_767);
    expect(value[4]).toEqual(-32_768); // one-over max interpreted as negative
    expect([...encodeAndDecode(i16Array(5), value)]).toEqual([...value]);
  });
});

describe('i32Array', () => {
  it('encodes and decodes a int32 array', () => {
    const value = new Int32Array([
      16, -2_147_483_648, 2_147_483_647, 2_147_483_648,
    ]);
    expect([...encodeAndDecode(i32Array(4), value)]).toEqual([...value]);
  });
});

describe('f32Array', () => {
  it('encodes and decodes a float32 array', () => {
    const value = new Float32Array([0.1, 0.2, 0.3]);
    expect([...encodeAndDecode(f32Array(3), value)]).toEqual([...value]);
  });
});

describe('f64Array', () => {
  it('encodes and decodes a float64 array', () => {
    const value = new Float64Array([0.1, 0.2, 0.3]);
    expect([...encodeAndDecode(f64Array(3), value)]).toEqual([...value]);
  });
});
