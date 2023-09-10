import * as chai from 'chai';
import { bool } from '../structure';
import { encodeAndDecode } from './_mock.test';

const expect = chai.expect;
describe('BoolSchema', () => {
  it('should encode and decode a bool value', () => {
    const value = Math.random() < 0.5;
    const decoded = encodeAndDecode(bool, value);

    expect(decoded).to.equal(value);
  });
});
