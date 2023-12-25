import * as chai from 'chai';

import { ArraySchema, i32, MaxValue } from '../structure';
import { arrayOf } from '../describe';
import { randIntBetween } from './random';
import { makeIO } from './helpers/mock';

const expect = chai.expect;

describe('ArraySchema', () => {
  it('should estimate an int-array encoding size', () => {
    const IntArray = arrayOf(i32);

    const length = randIntBetween(0, 200);
    const values = [];
    for (let i = 0; i < length; ++i) {
      values.push(randIntBetween(-10000, 10000));
    }

    expect(IntArray.measure(values).size).to.equal(
      i32.measure(MaxValue).size + length * i32.measure(MaxValue).size,
    );
  });

  it('should fail to estimate size of max value', () => {
    const IntArray = arrayOf(i32);

    expect(IntArray.measure(MaxValue).isUnbounded).to.be.true;
  });

  it('should encode and decode a simple int array', () => {
    const length = randIntBetween(0, 5);
    const value = [];
    for (let i = 0; i < length; ++i) {
      value.push(randIntBetween(-10000, 10000));
    }

    const description = new ArraySchema(i32);

    const { output, input } = makeIO(length * 4 + 4); // Extra 4 bytes for the length of the array
    description.write(output, value);
    expect(description.read(input)).to.deep.equal(value);
  });
});
