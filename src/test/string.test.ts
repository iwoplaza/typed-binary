import * as chai from 'chai';
import { randIntBetween } from './random';
import { STRING, } from '../structure';
import { encodeAndDecode } from './_mock.test';

const expect = chai.expect;
describe('StringSchema', () => {
    it('should encode and decode an empty string value', () => {
        const decoded = encodeAndDecode(STRING, '');

        expect(decoded).to.equal('');
    });

    it('should encode and decode an alphanumerical string', () => {
        const length = randIntBetween(0, 100);
        let value = '';
        const ranges = [['A', 'Z'], ['a', 'z'], ['0', '9']];
        for (let i = 0; i < length; ++i) {
            const range = ranges[randIntBetween(0, ranges.length) % ranges.length];
            value += String.fromCharCode(randIntBetween(range[0].charCodeAt(0), range[1].charCodeAt(0)));
        }

        const decoded = encodeAndDecode(STRING, value);
        expect(decoded).to.equal(value);
    });
});