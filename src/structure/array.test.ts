import * as chai from 'chai';
import { randIntBetween } from '../test/random';
import { makeIO } from './_mock.test';
import { ArraySchema, INT } from '.';

const expect = chai.expect;

describe('(read/write)Array', () => {
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