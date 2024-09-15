import { describe, expect, it } from 'vitest';
import { randBetween, randIntBetween } from '../test/random';
import { getSystemEndianness } from '../util';
import { BufferReader } from './bufferReader';
import { BufferWriter } from './bufferWriter';

describe('BufferWriter', () => {
  it('should encode a Uint8Array', () => {
    const uint8s = new Uint8Array([0, 1, 1, 2, 3, 5, 8, 255]);

    const buffer = Buffer.alloc(8);
    const writer = new BufferWriter(buffer);
    writer.writeSlice(uint8s);

    const reader = new BufferReader(buffer);
    expect(reader.readByte()).to.eq(0);
    expect(reader.readByte()).to.eq(1);
    expect(reader.readByte()).to.eq(1);
    expect(reader.readByte()).to.eq(2);
    expect(reader.readByte()).to.eq(3);
    expect(reader.readByte()).to.eq(5);
    expect(reader.readByte()).to.eq(8);
    expect(reader.readByte()).to.eq(255);
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
    const writer = new BufferWriter(buffer);
    writer.writeSlice(int32s);

    const reader = new BufferReader(buffer);
    expect(reader.readInt32()).to.eq(0);
    expect(reader.readInt32()).to.eq(1);
    expect(reader.readInt32()).to.eq(1);
    expect(reader.readInt32()).to.eq(2);
    expect(reader.readInt32()).to.eq(3);
    expect(reader.readInt32()).to.eq(5);
    expect(reader.readInt32()).to.eq(-2_147_483_648);
    expect(reader.readInt32()).to.eq(2_147_483_647);
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
    const writer = new BufferWriter(buffer);
    writer.writeSlice(uint32s);

    const reader = new BufferReader(buffer);
    expect(reader.readUint32()).to.eq(0);
    expect(reader.readUint32()).to.eq(1);
    expect(reader.readUint32()).to.eq(1);
    expect(reader.readUint32()).to.eq(2);
    expect(reader.readUint32()).to.eq(3);
    expect(reader.readUint32()).to.eq(5);
    expect(reader.readUint32()).to.eq(8);
    expect(reader.readUint32()).to.eq(4_294_967_295);
  });
});

describe('BufferReader', () => {
  it('should decode a Uint8Array', () => {
    const buffer = Buffer.alloc(4);
    const writer = new BufferWriter(buffer);
    writer.writeByte(0);
    writer.writeByte(15);
    writer.writeByte(64);
    writer.writeByte(255);

    const destBuffer = new ArrayBuffer(4);
    const destU8 = new Uint8Array(destBuffer);
    const reader = new BufferReader(buffer);
    reader.readSlice(destU8, 0, 4);

    expect([...destU8]).toEqual([0, 15, 64, 255]);
  });

  it('should decode a Uint32Array', () => {
    const buffer = Buffer.alloc(4 * 4);
    const writer = new BufferWriter(buffer);
    writer.writeUint32(0);
    writer.writeUint32(15);
    writer.writeUint32(255);
    writer.writeUint32(4_294_967_295);

    const destBuffer = new ArrayBuffer(4 * 4);
    const destU32 = new Uint32Array(destBuffer);
    const reader = new BufferReader(buffer);
    reader.readSlice(destU32, 0, destBuffer.byteLength);

    expect([...destU32]).toEqual([0, 15, 255, 4_294_967_295]);
  });

  it('should decode a Int32Array', () => {
    const buffer = Buffer.alloc(4 * 4);
    const writer = new BufferWriter(buffer);
    writer.writeInt32(0);
    writer.writeInt32(15);
    writer.writeInt32(-2_147_483_648);
    writer.writeInt32(2_147_483_647);

    const destBuffer = new ArrayBuffer(4 * 4);
    const destI32 = new Int32Array(destBuffer);
    const reader = new BufferReader(buffer);
    reader.readSlice(destI32, 0, destBuffer.byteLength);

    expect([...destI32]).toEqual([0, 15, -2_147_483_648, 2_147_483_647]);
  });
});

describe('BufferWriter/BufferReader', () => {
  it('parses options correctly', () => {
    const buffer = Buffer.alloc(16);

    const noOptions = new BufferWriter(buffer);
    expect(noOptions.endianness).toEqual(getSystemEndianness());
    expect(noOptions.currentByteOffset).toEqual(0);

    const withByteOffset = new BufferWriter(buffer, { byteOffset: 16 });
    expect(withByteOffset.endianness).toEqual(getSystemEndianness());
    expect(withByteOffset.currentByteOffset).toEqual(16);

    const withBigEndian = new BufferWriter(buffer, { endianness: 'big' });
    expect(withBigEndian.endianness).toEqual('big');
    expect(withBigEndian.currentByteOffset).toEqual(0);

    const withLittleEndian = new BufferWriter(buffer, { endianness: 'little' });
    expect(withLittleEndian.endianness).toEqual('little');
    expect(withLittleEndian.currentByteOffset).toEqual(0);
  });

  it('should encode and decode int sequence', () => {
    // Generating random int sequence
    const intList = [];
    for (let i = 0; i < randIntBetween(1, 10); ++i) {
      intList.push(randIntBetween(-100, 100));
    }

    // Creating appropriate buffer
    const buffer = Buffer.alloc(intList.length * 4);

    // Writer
    const writer = new BufferWriter(buffer);

    // Writing the ints
    for (const int of intList) {
      writer.writeInt32(int);
    }

    // Expecting specific buffer offset
    expect(writer.currentByteOffset).to.equal(intList.length * 4);

    // Reading the ints
    const reader = new BufferReader(buffer);
    for (let i = 0; i < intList.length; ++i) {
      expect(reader.readInt32()).to.equal(intList[i]);
    }
  });

  it('should encode and decode f32 sequence', () => {
    // Generating random int sequence
    const floatList = [];
    for (let i = 0; i < randIntBetween(1, 10); ++i) {
      floatList.push(randBetween(-100, 100));
    }

    // Creating appropriate buffer
    const buffer = Buffer.alloc(floatList.length * 4);

    // Writer
    const writer = new BufferWriter(buffer);

    // Writing the ints
    for (const float of floatList) {
      writer.writeFloat32(float);
    }

    // Expecting specific buffer offset
    expect(writer.currentByteOffset).to.equal(floatList.length * 4);

    // Reading the floats
    const reader = new BufferReader(buffer);
    for (let i = 0; i < floatList.length; ++i) {
      expect(reader.readFloat32()).to.be.closeTo(floatList[i], 0.001);
    }
  });
});
