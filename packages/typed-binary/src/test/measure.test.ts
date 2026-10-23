import { describe, expect, it } from 'vitest';

// Importing from the public API
import * as bin from '../index.ts';

describe('unbounded max size', () => {
  it('propagates through objects', () => {
    expect(bin.struct({ a: bin.i32, b: bin.string, c: bin.i32 }).maxSize).toBeNaN();
    expect(bin.struct({ a: bin.i32, b: bin.dynamicArray(bin.i32) }).maxSize).toBeNaN();
  });

  it('propagates through other containers', () => {
    expect(bin.optional(bin.string).measure(bin.MaxValue)).toBeNaN();
    expect(bin.tuple([bin.i32, bin.string]).measure(bin.MaxValue)).toBeNaN();
    expect(bin.array(bin.string, 2).measure(bin.MaxValue)).toBeNaN();
  });

  it('treats an unbounded sub-type as the biggest one', () => {
    const Generic = bin.union(bin.u8, {
      0: { label: bin.string },
      1: { value: bin.i32 },
    });

    expect(Generic.measure(bin.MaxValue)).toBeNaN();
  });

  it('keeps bounded schemas bounded', () => {
    expect(bin.struct({ a: bin.i32, b: bin.tuple([bin.i32, bin.i32]) }).maxSize).toEqual(12);
  });
});
