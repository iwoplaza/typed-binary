import * as chai from 'chai';
import { randBetween } from './random';
import { f32 } from '../structure';
import { encodeAndDecode } from './_mock.test';

const expect = chai.expect;
describe('FloatSchema', () => {
  it('should encode and decode a f32 value', () => {
    const value = randBetween(-100, 100);
    const decoded = encodeAndDecode(f32, value);

    expect(decoded).to.closeTo(value, 0.01);
  });
});
