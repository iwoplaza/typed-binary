import { BufferWriter } from 'typed-binary';

describe('BufferWriter', () => {
  it('writes a uint32 from an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    const writer = new BufferWriter(buffer);

    writer.writeUint32(256);

    const u32View = new Uint32Array(buffer);
    expect(u32View[0]).to.equal(256);
  });

  it('writes an int32 array to an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    const writer = new BufferWriter(buffer);

    const i32Array = new Int32Array([1, 2, 3]);
    writer.writeSlice(i32Array);

    const i32View = new Int32Array(buffer);
    expect(i32View[0]).to.equal(1);
    expect(i32View[1]).to.equal(2);
    expect(i32View[2]).to.equal(3);
  });

  it('writes a uint32 array to an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    const writer = new BufferWriter(buffer);

    const u32Array = new Uint32Array([1, 2, 3]);
    writer.writeSlice(u32Array);

    const u32View = new Uint32Array(buffer);
    expect(u32View[0]).to.equal(1);
    expect(u32View[1]).to.equal(2);
    expect(u32View[2]).to.equal(3);
  });
});
