import { cursor, i32Array, string, u32, u32Array } from 'typed-binary';

describe('cursor', () => {
  it('reads a uint32 from an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    const u32View = new Uint32Array(buffer);
    u32View[0] = 256;

    expect(u32.read(cursor(buffer))).to.equal(256);
  });

  it('reads an int32 array from an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(3 * 4);
    const i32View = new Int32Array(buffer);

    i32View[0] = 1;
    i32View[1] = 2;
    i32View[2] = 3;

    expect([...i32Array(3).read(cursor(buffer))]).to.deep.eq([1, 2, 3]);
  });

  it('writes a uint32 to an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    u32.write(cursor(buffer), 256);

    const u32View = new Uint32Array(buffer);
    expect(u32View[0]).to.equal(256);
  });

  it('writes an int32 array to an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    i32Array(3).write(cursor(buffer), new Int32Array([1, 2, 3]));

    const i32View = new Int32Array(buffer);
    expect(i32View[0]).to.equal(1);
    expect(i32View[1]).to.equal(2);
    expect(i32View[2]).to.equal(3);
  });

  it('writes a uint32 array to an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    u32Array(3).write(cursor(buffer), new Uint32Array([1, 2, 3]));

    const u32View = new Uint32Array(buffer);
    expect(u32View[0]).to.equal(1);
    expect(u32View[1]).to.equal(2);
    expect(u32View[2]).to.equal(3);
  });

  it('roundtrips a string', () => {
    const buffer = new ArrayBuffer(64);
    string.write(cursor(buffer), 'Hello, 世界');

    expect(string.read(cursor(buffer))).to.equal('Hello, 世界');
  });
});
