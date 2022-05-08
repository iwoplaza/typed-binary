import * as chai from 'chai';
import { randIntBetween } from './random';
import { makeIO } from './_mock.test';
import { ArraySchema, INT } from '../structure';
import { arrayOf } from '..';

const expect = chai.expect;

describe('ArrayScheme', () => {
    it('should estimate an int-array encoding size', () => {
        const IntArray = arrayOf(INT);

        const length = randIntBetween(0, 200);
        const values = [];
        for (let i = 0; i < length; ++i) {
            values.push(randIntBetween(-10000, 10000));
        }

        expect(IntArray.sizeOf(values)).to.equal(INT.sizeOf() + length * INT.sizeOf());
    });

    it('should encode and decode a simple int array', () => {
        const length = randIntBetween(0, 5);
        const value = [];
        for (let i = 0; i < length; ++i) {
            value.push(randIntBetween(-10000, 10000));
        }

        const description = new ArraySchema(INT);

        const { output, input } = makeIO(length * 4 + 4); // Extra 4 bytes for the length of the array
        description.write(output, value);
        expect(description.read(input)).to.deep.equal(value);
    });
});