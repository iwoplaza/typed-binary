import { describe, it, expect } from 'vitest';
import { BufferWriter } from './bufferWriter';
import { BufferReader } from './bufferReader';
import { randBetween, randIntBetween } from '../test/random';

describe('BufferWriter/BufferReader', () => {
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

  it('should encode a Uint32Array', () => {
    const uint32s = new Uint32Array([
      0,
      1,
      1,
      2,
      3,
      5,
      8,
      Number.MAX_SAFE_INTEGER,
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
    expect(reader.readUint32()).to.eq(Number.MAX_SAFE_INTEGER);
  });
});
