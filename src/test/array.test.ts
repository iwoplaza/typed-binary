import * as chai from 'chai';
import { randIntBetween } from './random';
import { makeIO } from './_mock.test';
import { ArraySchema, i32 } from '../structure';
import { arrayOf } from '..';

const expect = chai.expect;

describe('ArraySchema', () => {
  it('should estimate an int-array encoding size', () => {
    const IntArray = arrayOf(i32);

    const length = randIntBetween(0, 200);
    const values = [];
    for (let i = 0; i < length; ++i) {
      values.push(randIntBetween(-10000, 10000));
    }

    expect(IntArray.sizeOf(values)).to.equal(
      i32.sizeOf() + length * i32.sizeOf(),
    );
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
