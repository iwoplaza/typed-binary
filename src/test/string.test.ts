import * as chai from 'chai';
import { randIntBetween } from './random';
import { string } from '../structure';
import { encodeAndDecode } from './helpers/mock';

const expect = chai.expect;
describe('StringSchema', () => {
  it('should encode and decode an empty string value', () => {
    const decoded = encodeAndDecode(string, '');

    expect(decoded).to.equal('');
  });

  it('should encode and decode an alphanumerical string', () => {
    const length = randIntBetween(0, 100);
    let value = '';
    const ranges = [
      ['A', 'Z'],
      ['a', 'z'],
      ['0', '9'],
    ];
    for (let i = 0; i < length; ++i) {
      const range = ranges[randIntBetween(0, ranges.length) % ranges.length];
      value += String.fromCharCode(
        randIntBetween(range[0].charCodeAt(0), range[1].charCodeAt(0)),
      );
    }

    const decoded = encodeAndDecode(string, value);
    expect(decoded).to.equal(value);
  });
});
