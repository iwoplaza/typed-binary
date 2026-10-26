import { describe, expect, it } from 'vitest';

import * as bin from 'typed-binary';
import { makeIO } from './helpers/mock.ts';

describe('bin.dynamicArray', () => {
  it('should estimate an int-array encoding size', () => {
    const IntArray = bin.dynamicArray(bin.i32);

    expect(IntArray.measure([])).toEqual(4);
    expect(IntArray.measure([-10000, 0, 42, 9999, 7])).toEqual(4 + 5 * 4);
  });

  it('should fail to estimate size of max value', () => {
    const IntArray = bin.dynamicArray(bin.i32);

    expect(IntArray.measure(bin.MaxValue)).toBeNaN();
  });

  it('should encode and decode simple int arrays', () => {
    const description = bin.dynamicArray(bin.i32);

    for (const value of [[], [42], [-10000, 0, 1, 9999]]) {
      const { output, input } = makeIO(value.length * 4 + 4); // Extra 4 bytes for the length of the array
      description.write(output, value);
      expect(description.read(input)).to.deep.equal(value);
    }
  });
});
