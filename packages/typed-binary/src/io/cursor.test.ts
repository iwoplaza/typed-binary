import { Buffer } from 'node:buffer';

import { describe, expect, it } from 'vitest';
import { f32, f64Array, f32Array, i32, i32Array, u8, u8Array, u32, u32Array } from '../index.ts';
import { randBetween, randIntBetween } from '../test/random.ts';
import { getSystemEndianness } from '../util.ts';
import { cursor } from './cursor.ts';

describe('cursor', () => {
  it('parses options correctly', () => {
    const buffer = Buffer.alloc(16);
    const systemLittleEndian = getSystemEndianness() === 'little';

    const noOptions = cursor(buffer);
    expect(noOptions.littleEndian).toEqual(systemLittleEndian);
    expect(noOptions.offset).toEqual(0);

    const withByteOffset = cursor(buffer, { byteOffset: 16 });
    expect(withByteOffset.littleEndian).toEqual(systemLittleEndian);
    expect(withByteOffset.offset).toEqual(16);

    const withBigEndian = cursor(buffer, { endianness: 'big' });
    expect(withBigEndian.littleEndian).toEqual(false);
    expect(withBigEndian.offset).toEqual(0);

    const withLittleEndian = cursor(buffer, { endianness: 'little' });
    expect(withLittleEndian.littleEndian).toEqual(true);
    expect(withLittleEndian.offset).toEqual(0);
  });

  it('counts offsets from the start of the given view', () => {
    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer, 4, 4);

    const output = cursor(view);
    expect(output.offset).toEqual(0);
    u8.write(output, 7);

    expect([...new Uint8Array(buffer)]).toEqual([0, 0, 0, 0, 7, 0, 0, 0]);
    expect(u8.read(cursor(view))).toEqual(7);
  });

  it('follows the size of a resizable buffer', () => {
    const buffer = new ArrayBuffer(2, { maxByteLength: 8 });
    const output = cursor(buffer);
    expect(() => u32.write(output, 1)).toThrow(RangeError);

    buffer.resize(8);
    u32.write(output, 1);
    u32.write(output, 2);
    expect(output.offset).toEqual(8);
  });

  it('cannot write past the end of the given view', () => {
    const buffer = new ArrayBuffer(8);
    const output = cursor(new Uint8Array(buffer, 0, 2));

    expect(() => u32.write(output, 1)).toThrow(RangeError);
  });

  it('writes scalars respecting endianness', () => {
    const buffer = new ArrayBuffer(4);
    u32.write(cursor(buffer, { endianness: 'big' }), 0x01020304);
    expect([...new Uint8Array(buffer)]).toEqual([0x01, 0x02, 0x03, 0x04]);

    u32.write(cursor(buffer, { endianness: 'little' }), 0x01020304);
    expect([...new Uint8Array(buffer)]).toEqual([0x04, 0x03, 0x02, 0x01]);
  });

  it('should encode and decode int sequence', () => {
    const intList: number[] = [];
    for (let i = 0; i < randIntBetween(1, 10); ++i) {
      intList.push(randIntBetween(-100, 100));
    }

    const buffer = Buffer.alloc(intList.length * 4);

    const output = cursor(buffer);
    for (const int of intList) {
      i32.write(output, int);
    }
    expect(output.offset).to.equal(intList.length * 4);

    const input = cursor(buffer);
    for (let i = 0; i < intList.length; ++i) {
      expect(i32.read(input)).to.equal(intList[i]);
    }
  });

  it('should encode and decode f32 sequence', () => {
    const floatList: number[] = [];
    for (let i = 0; i < randIntBetween(1, 10); ++i) {
      floatList.push(randBetween(-100, 100));
    }

    const buffer = Buffer.alloc(floatList.length * 4);

    const output = cursor(buffer);
    for (const float of floatList) {
      f32.write(output, float);
    }
    expect(output.offset).to.equal(floatList.length * 4);

    const input = cursor(buffer);
    for (let i = 0; i < floatList.length; ++i) {
      expect(f32.read(input)).to.be.closeTo(floatList[i], 0.001);
    }
  });
});

describe('typed array slices', () => {
  it('should encode a Uint8Array', () => {
    const uint8s = new Uint8Array([0, 1, 1, 2, 3, 5, 8, 255]);

    const buffer = Buffer.alloc(8);
    u8Array(8).write(cursor(buffer), uint8s);

    const input = cursor(buffer);
    for (const value of uint8s) {
      expect(u8.read(input)).to.eq(value);
    }
  });

  it('should encode a Int32Array', () => {
    const int32s = new Int32Array([
      0,
      1,
      1,
      2,
      3,
      5,
      -2_147_483_648, // min signed 32-bit integer value
      2_147_483_647, // max signed 32-bit integer value
    ]);

    const buffer = Buffer.alloc(8 * 4);
    i32Array(8).write(cursor(buffer), int32s);

    const input = cursor(buffer);
    for (const value of int32s) {
      expect(i32.read(input)).to.eq(value);
    }
  });

  it('should encode a Uint32Array', () => {
    const uint32s = new Uint32Array([
      0,
      1,
      1,
      2,
      3,
      5,
      8,
      4_294_967_295, // max unsigned 32-bit integer value
    ]);

    const buffer = Buffer.alloc(8 * 4);
    u32Array(8).write(cursor(buffer), uint32s);

    const input = cursor(buffer);
    for (const value of uint32s) {
      expect(u32.read(input)).to.eq(value);
    }
  });

  it('respects view length when writing slice (#35)', () => {
    // A 100 byte Uint8Array view into a 512 byte ArrayBuffer, at offset 10.
    const srcView = new Uint8Array(new ArrayBuffer(512), 10, 100);

    const output = cursor(new ArrayBuffer(512));
    u8Array(100).write(output, srcView);
    expect(output.offset).toEqual(100);
  });

  it('should decode a Uint8Array', () => {
    const buffer = Buffer.alloc(4);
    const output = cursor(buffer);
    for (const value of [0, 15, 64, 255]) {
      u8.write(output, value);
    }

    expect([...u8Array(4).read(cursor(buffer))]).toEqual([0, 15, 64, 255]);
  });

  it('should decode a Uint32Array', () => {
    const buffer = Buffer.alloc(4 * 4);
    const output = cursor(buffer);
    for (const value of [0, 15, 255, 4_294_967_295]) {
      u32.write(output, value);
    }

    expect([...u32Array(4).read(cursor(buffer))]).toEqual([0, 15, 255, 4_294_967_295]);
  });

  it('should decode a Int32Array', () => {
    const buffer = Buffer.alloc(4 * 4);
    const output = cursor(buffer);
    for (const value of [0, 15, -2_147_483_648, 2_147_483_647]) {
      i32.write(output, value);
    }

    expect([...i32Array(4).read(cursor(buffer))]).toEqual([0, 15, -2_147_483_648, 2_147_483_647]);
  });

  it('writes Int32Array in big-endian byte order', () => {
    const buffer = new ArrayBuffer(4);
    i32Array(1).write(cursor(buffer, { endianness: 'big' }), new Int32Array([0x01020304]));

    expect([...new Uint8Array(buffer)]).toEqual([0x01, 0x02, 0x03, 0x04]);
  });

  it('writes Int32Array in little-endian byte order', () => {
    const buffer = new ArrayBuffer(4);
    i32Array(1).write(cursor(buffer, { endianness: 'little' }), new Int32Array([0x01020304]));

    expect([...new Uint8Array(buffer)]).toEqual([0x04, 0x03, 0x02, 0x01]);
  });

  it('writes Float32Array respecting endianness', () => {
    const value = new Float32Array([1.5]);
    const beBuffer = new ArrayBuffer(4);
    const leBuffer = new ArrayBuffer(4);
    f32Array(1).write(cursor(beBuffer, { endianness: 'big' }), value);
    f32Array(1).write(cursor(leBuffer, { endianness: 'little' }), value);

    const beBytes = [...new Uint8Array(beBuffer)];
    const leBytes = [...new Uint8Array(leBuffer)];
    expect(beBytes).toEqual([...leBytes].reverse());
  });

  it('reads Int32Array from big-endian buffer', () => {
    const buffer = new ArrayBuffer(8);
    new Uint8Array(buffer).set([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02]);

    const dest = i32Array(2).read(cursor(buffer, { endianness: 'big' }));
    expect([...dest]).toEqual([1, 2]);
  });

  it('reads Int32Array from little-endian buffer', () => {
    const buffer = new ArrayBuffer(8);
    new Uint8Array(buffer).set([0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00]);

    const dest = i32Array(2).read(cursor(buffer, { endianness: 'little' }));
    expect([...dest]).toEqual([1, 2]);
  });

  it('roundtrips Int32Array through big-endian cursors', () => {
    const src = new Int32Array([0, 1, -1, 2_147_483_647, -2_147_483_648]);
    const schema = i32Array(src.length);
    const buffer = new ArrayBuffer(src.byteLength);
    schema.write(cursor(buffer, { endianness: 'big' }), src);

    expect([...schema.read(cursor(buffer, { endianness: 'big' }))]).toEqual([...src]);
  });

  it('roundtrips Float64Array through big-endian cursors', () => {
    const src = new Float64Array([0.1, -0.5, Math.PI]);
    const schema = f64Array(src.length);
    const buffer = new ArrayBuffer(src.byteLength);
    schema.write(cursor(buffer, { endianness: 'big' }), src);

    expect([...schema.read(cursor(buffer, { endianness: 'big' }))]).toEqual([...src]);
  });

  it('reads and writes slices within a view at an offset', () => {
    const buffer = new ArrayBuffer(12);
    const view = new Uint8Array(buffer, 4, 8);
    const src = new Uint32Array([1, 2]);

    u32Array(2).write(cursor(view), src);
    expect([...u32Array(2).read(cursor(view))]).toEqual([1, 2]);
    expect(new Uint8Array(buffer, 0, 4).every((b) => b === 0)).toBe(true);
  });
});
