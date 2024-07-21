import { BufferReader, BufferWriter } from 'typed-binary';

describe('BufferWriter', () => {
  it('writes and reads from an ArrayBuffer', () => {
    const buffer = new ArrayBuffer(64);
    const writer = new BufferWriter(buffer);

    writer.writeUint32(256);

    const reader = new BufferReader(buffer);
    expect(reader.readUint32()).to.equal(256);
  });
});
