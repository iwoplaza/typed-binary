import { BufferReader } from 'typed-binary';

describe('BufferReader', () => {
  it('reads a uint32 from an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    const u32Array = new Uint32Array(buffer);
    u32Array[0] = 256;

    const reader = new BufferReader(buffer);
    expect(reader.readUint32()).to.equal(256);
  });

  it('reads an int32 array from an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(3 * 4);
    const i32View = new Int32Array(buffer);

    i32View[0] = 1;
    i32View[1] = 2;
    i32View[2] = 3;

    const i32Array = new Int32Array(3);
    const reader = new BufferReader(buffer);
    reader.readSlice(i32Array, 0, i32Array.byteLength);

    expect([...i32Array]).to.deep.eq([1, 2, 3]);
  });
});
