import { describe, expect, it } from 'vitest';

import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.i8', () => {
  it('should encode and decode signed int8 values', () => {
    for (const value of [-128, -1, 0, 1, 127]) {
      expect(encodeAndDecode(bin.i8, value)).to.equal(value);
    }
  });
});

describe('bin.u8', () => {
  it('should encode and decode byte values', () => {
    for (const value of [0, 1, 128, 255]) {
      expect(encodeAndDecode(bin.u8, value)).to.equal(value);
    }
  });
});

describe('bin.i16', () => {
  it('should encode and decode int values', () => {
    for (const value of [-(2 ** 15), -1, 0, 1, 1234]) {
      expect(encodeAndDecode(bin.i16, value)).to.equal(value);
    }
  });

  it('should encode and decode the max pos int value', () => {
    const value = 2 ** 15 - 1;
    const decoded = encodeAndDecode(bin.i16, value);

    expect(decoded).to.equal(value);
  });
});

describe('bin.u16', () => {
  it('should encode and decode uint16 values', () => {
    for (const value of [0, 1, 1234]) {
      expect(encodeAndDecode(bin.u16, value)).to.equal(value);
    }
  });

  it('should encode and decode the max uint16 value', () => {
    const value = 2 ** 16 - 1;
    const decoded = encodeAndDecode(bin.u16, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into 0', () => {
    const decoded = encodeAndDecode(bin.u16, 2 ** 16);

    expect(decoded).to.equal(0);
  });
});

describe('bin.i32', () => {
  it('should encode and decode int values', () => {
    for (const value of [-(2 ** 31), -1, 0, 1, 123456]) {
      expect(encodeAndDecode(bin.i32, value)).to.equal(value);
    }
  });

  it('should encode and decode the max pos int value', () => {
    const value = 2 ** 31 - 1;
    const decoded = encodeAndDecode(bin.i32, value);

    expect(decoded).to.equal(value);
  });
});

describe('bin.u32', () => {
  it('should encode and decode uint values', () => {
    for (const value of [0, 1, 123456]) {
      expect(encodeAndDecode(bin.u32, value)).to.equal(value);
    }
  });

  it('should encode and decode the max uint value', () => {
    const value = 2 ** 32 - 1;
    const decoded = encodeAndDecode(bin.u32, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into 0', () => {
    const decoded = encodeAndDecode(bin.u32, 2 ** 32);

    expect(decoded).to.equal(0);
  });
});

describe('bin.i64', () => {
  it('should encode and decode int64 values', () => {
    for (const value of [-1n, 0n, 1n, 123456n]) {
      expect(encodeAndDecode(bin.i64, value)).to.equal(value);
    }
  });

  it('should encode and decode the max int64 value', () => {
    const value = 2n ** 63n - 1n;
    const decoded = encodeAndDecode(bin.i64, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the min int64 value', () => {
    const value = -(2n ** 63n);
    const decoded = encodeAndDecode(bin.i64, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into min', () => {
    const decoded = encodeAndDecode(bin.i64, 2n ** 63n);

    expect(decoded).to.equal(-(2n ** 63n));
  });

  it('should take up 8 bytes', () => {
    expect(bin.i64.maxSize).to.equal(8);
    expect(bin.i64.measure(0n)).to.equal(8);
  });
});

describe('bin.u64', () => {
  it('should encode and decode uint64 values', () => {
    for (const value of [0n, 1n, 123456n]) {
      expect(encodeAndDecode(bin.u64, value)).to.equal(value);
    }
  });

  it('should encode and decode the max uint64 value', () => {
    const value = 2n ** 64n - 1n;
    const decoded = encodeAndDecode(bin.u64, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into 0', () => {
    const decoded = encodeAndDecode(bin.u64, 2n ** 64n);

    expect(decoded).to.equal(0n);
  });

  it('negative values should wrap around', () => {
    const decoded = encodeAndDecode(bin.u64, -1n);

    expect(decoded).to.equal(2n ** 64n - 1n);
  });

  it('should respect the endianness of the cursor', () => {
    const buffer = new ArrayBuffer(8);
    bin.u64.write(bin.cursor(buffer, { endianness: 'big' }), 0x0102030405060708n);

    expect([...new Uint8Array(buffer)]).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(bin.u64.read(bin.cursor(buffer, { endianness: 'little' }))).to.equal(
      0x0807060504030201n,
    );
  });
});
