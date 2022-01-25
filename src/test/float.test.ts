import * as chai from 'chai';
import { randBetween } from './random';
import { FLOAT } from '../structure';
import { encodeAndDecode } from './_mock.test';

const expect = chai.expect;
describe('FloatSchema', () => {
    it('should encode and decode a float value', () => {
        const value = randBetween(-100, 100);
        const decoded = encodeAndDecode(FLOAT, value);

        expect(decoded).to.closeTo(value, 0.01);
    });
});