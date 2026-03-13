import { describe, expect, it } from 'vitest';

import bin from 'typed-binary';
import { makeIO } from './helpers/mock.ts';
import { randIntBetween } from './random.ts';

describe('bin.dynamicArray', () => {
  it('should estimate an int-array encoding size', () => {
    const IntArray = bin.dynamicArray(bin.i32);

    const length = randIntBetween(0, 200);
    const values = [];
    for (let i = 0; i < length; ++i) {
      values.push(randIntBetween(-10000, 10000));
    }

    expect(IntArray.measure(values).size).toEqual(
      bin.i32.measure(bin.MaxValue).size + length * bin.i32.measure(bin.MaxValue).size,
    );
  });

  it('should fail to estimate size of max value', () => {
    const IntArray = bin.dynamicArray(bin.i32);

    expect(IntArray.measure(bin.MaxValue).isUnbounded).toEqual(true);
  });

  it('should encode and decode a simple int array', () => {
    const length = randIntBetween(0, 5);
    const value = [];
    for (let i = 0; i < length; ++i) {
      value.push(randIntBetween(-10000, 10000));
    }

    const description = bin.dynamicArray(bin.i32);

    const { output, input } = makeIO(length * 4 + 4); // Extra 4 bytes for the length of the array
    description.write(output, value);
    expect(description.read(input)).to.deep.equal(value);
  });
});
