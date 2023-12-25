import * as chai from 'chai';
import { randIntBetween } from './random';
import { encodeAndDecode } from './helpers/mock';
import { CharsSchema } from '../structure';

const expect = chai.expect;

describe('CharsSchema', () => {
  it('should encode and decode fixed-size char array', () => {
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

    const description = new CharsSchema(value.length);
    expect(encodeAndDecode(description, value)).to.equal(value);
  });
});
