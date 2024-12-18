import { describe, expect, it } from 'vitest';

// Importing from the public API
import bin from '../index.ts';
// Helpers
import { encodeAndDecode } from './helpers/mock.ts';

describe('TupleSchema', () => {
  it('should estimate an [i32, bool] encoding size', () => {
    const Schema = bin.tupleOf([bin.i32, bin.bool]);

    expect(Schema.measure([123, false]).size).toEqual(
      bin.i32.measure(bin.MaxValue).size + bin.bool.measure(bin.MaxValue).size,
    );
  });

  it('should properly estimate size of max value', () => {
    const Schema = bin.tupleOf([bin.i32, bin.bool]);

    expect(Schema.measure(bin.MaxValue).size).toEqual(
      bin.i32.measure(bin.MaxValue).size + bin.bool.measure(bin.MaxValue).size,
    );
  });

  it('should encode and decode [i32, bool]', () => {
    const Schema = bin.tupleOf([bin.i32, bin.bool]);

    expect(encodeAndDecode(Schema, [123, false])).toEqual([123, false]);
  });
});
