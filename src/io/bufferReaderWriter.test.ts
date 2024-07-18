import { describe, it, expect } from 'vitest';
import { BufferWriter } from './bufferWriter';
import { BufferReader } from './bufferReader';
import { randBetween, randIntBetween } from '../test/random';
import { getSystemEndianness } from '../util';

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
