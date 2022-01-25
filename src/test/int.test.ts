import * as chai from 'chai';
import { randIntBetween } from './random';
import { INT } from '../structure';
import { encodeAndDecode } from './_mock.test';

const expect = chai.expect;
describe('IntSchema', () => {
    it('should encode and decode an int value', () => {
        const value = randIntBetween(-100, 100);
        const decoded = encodeAndDecode(INT, value);

        expect(decoded).to.equal(value);
    });
});