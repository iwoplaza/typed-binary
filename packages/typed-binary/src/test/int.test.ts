import { describe, expect, it } from 'vitest';

import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';
import { randIntBetween } from './random.ts';

describe('bin.i8', () => {
  it('should encode and decode a signed int8 value', () => {
    const value = randIntBetween(-128, 127);
    const decoded = encodeAndDecode(bin.i8, value);

    expect(decoded).to.equal(value);
  });
});

describe('bin.u8', () => {
  it('should encode and decode a byte value', () => {
    const value = randIntBetween(0, 256);
    const decoded = encodeAndDecode(bin.u8, value);

    expect(decoded).to.equal(value);
  });
});

describe('bin.i16', () => {
  it('should encode and decode an int value', () => {
    const value = randIntBetween(-100, 100);
    const decoded = encodeAndDecode(bin.i16, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max pos int value', () => {
    const value = 2 ** 15 - 1;
    const decoded = encodeAndDecode(bin.i16, value);

    expect(decoded).to.equal(value);
  });
});

describe('bin.u16', () => {
  it('should encode and decode an uint16 value', () => {
    const value = randIntBetween(0, 100);
    const decoded = encodeAndDecode(bin.u16, value);

    expect(decoded).to.equal(value);
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
  it('should encode and decode an int value', () => {
    const value = randIntBetween(-100, 100);
    const decoded = encodeAndDecode(bin.i32, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max pos int value', () => {
    const value = 2 ** 31 - 1;
    const decoded = encodeAndDecode(bin.i32, value);

    expect(decoded).to.equal(value);
  });
});

describe('bin.u32', () => {
  it('should encode and decode an uint value', () => {
    const value = randIntBetween(0, 100);
    const decoded = encodeAndDecode(bin.u32, value);

    expect(decoded).to.equal(value);
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

describe('BigInt64Schema', () => {
  it('should encode and decode an bigint value', () => {
    const value = BigInt(randIntBetween(-100, 100));
    const decoded = encodeAndDecode(bin.bigint, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max bigint value', () => {
    const value = BigInt(2 ** 63) - 1n;
    const decoded = encodeAndDecode(bin.bigint, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into 0', () => {
    const decoded = encodeAndDecode(bin.bigint, BigInt(2 ** 64));

    expect(decoded).to.equal(0n);
  });
});

describe('BigUint64Schema', () => {
  it('should encode and decode an bigint value', () => {
    const value = BigInt(randIntBetween(0, 100));
    const decoded = encodeAndDecode(bin.biguint, value);

    expect(decoded).to.equal(value);
  });

  it('should encode and decode the max biguint value', () => {
    const value = BigInt(2 ** 64) - 1n;
    const decoded = encodeAndDecode(bin.biguint, value);

    expect(decoded).to.equal(value);
  });

  it('max + 1 should overflow into 0', () => {
    const decoded = encodeAndDecode(bin.biguint, BigInt(2 ** 64));

    expect(decoded).to.equal(0n);
  });
});
