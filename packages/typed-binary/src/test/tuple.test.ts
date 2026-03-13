import { describe, expect, it } from 'vitest';

import bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.tuple', () => {
  it('should estimate an [i32, bool] encoding size', () => {
    const Schema = bin.tuple([bin.i32, bin.bool]);

    expect(Schema.measure([123, false]).size).toEqual(
      bin.i32.measure(bin.MaxValue).size + bin.bool.measure(bin.MaxValue).size,
    );
  });

  it('should properly estimate size of max value', () => {
    const Schema = bin.tuple([bin.i32, bin.bool]);

    expect(Schema.measure(bin.MaxValue).size).toEqual(
      bin.i32.measure(bin.MaxValue).size + bin.bool.measure(bin.MaxValue).size,
    );
  });

  it('should encode and decode [i32, bool]', () => {
    const Schema = bin.tuple([bin.i32, bin.bool]);

    expect(encodeAndDecode(Schema, [123, false])).toEqual([123, false]);
  });
});
