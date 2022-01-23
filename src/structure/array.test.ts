import * as chai from 'chai';
import { randIntBetween } from '../../test/random';
import { makeIO } from './_mock.test';
import { writeSerial, readSerial, TypeKey } from '.';

const expect = chai.expect;

describe('(read/write)Array', () => {
    it('should encode and decode a simple int array', () => {
        const length = randIntBetween(0, 5);
        let value = [];
        for (let i = 0; i < length; ++i) {
            value.push(randIntBetween(-10000, 10000));
        }

        const description = { type: TypeKey.ARRAY as const, elementType: { type: TypeKey.INT as const } };

        const { output, input } = makeIO(length * 4 + 4); // Extra 4 bytes for the length of the array
        writeSerial({}, output, description, value);
        expect(readSerial({}, input, description)).to.deep.equal(value);
    });
});