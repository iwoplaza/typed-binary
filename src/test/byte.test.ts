import * as chai from 'chai';
import { randIntBetween } from './random';
import { BYTE } from '../structure';
import { encodeAndDecode } from './_mock.test';

const expect = chai.expect;
describe('ByteSchema', () => {
    it('should encode and decode a byte value', () => {
        const value = randIntBetween(0, 256);
        const decoded = encodeAndDecode(BYTE, value);

        expect(decoded).to.equal(value);
    });
});