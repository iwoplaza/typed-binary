import * as chai from 'chai';
import { randIntBetween } from './random';
import { byte } from '../structure';
import { encodeAndDecode } from './_mock.test';

const expect = chai.expect;
describe('ByteSchema', () => {
  it('should encode and decode a byte value', () => {
    const value = randIntBetween(0, 256);
    const decoded = encodeAndDecode(byte, value);

    expect(decoded).to.equal(value);
  });
});
