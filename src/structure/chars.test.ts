import * as chai from 'chai';
import { randIntBetween } from '../../test/random';
import { makeIO } from './_mock.test';
import { writeSerial, readSerial, TypeKey } from '.';

const expect = chai.expect;

describe('(read/write)Chars', () => {
    it('should encode and decode fixed-size char array', () => {
        const length = randIntBetween(0, 100);
        let value = '';
        const ranges = [['A', 'Z'], ['a', 'z'], ['0', '9']];
        for (let i = 0; i < length; ++i) {
            const range = ranges[randIntBetween(0, ranges.length) % ranges.length];
            value += String.fromCharCode(randIntBetween(range[0].charCodeAt(0), range[1].charCodeAt(0)));
        }

        const description = { type: TypeKey.CHARS as const, length: value.length };

        const { output, input } = makeIO(length);
        writeSerial({}, output, description, value);
        expect(readSerial({}, input, description)).to.equal(value);
    });
});