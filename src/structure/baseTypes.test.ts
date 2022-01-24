import * as mocha from 'mocha';
import * as chai from 'chai';
import { randBetween, randIntBetween } from '../../test/random';
import { BufferReader, BufferWriter } from '../io';
import { Schema } from './types';
import { BOOL, BYTE, INT, FLOAT, STRING, } from '.';


function encodeAndDecode<T extends Schema<any>, P extends T['_infered']>(description: T, value: P, bufferSize: number): P {
    const buffer = Buffer.alloc(bufferSize);
    description.write(new BufferWriter(buffer), value);

    return description.read(new BufferReader(buffer));
}

const expect = chai.expect;
describe('(read/write)BaseType', () => {
    it('should encode and decode a bool value', () => {
        const value = Math.random() < 0.5;
        const decoded = encodeAndDecode(BOOL, value, 1);

        expect(decoded).to.equal(value);
    });

    it('should encode and decode a byte value', () => {
        const value = randIntBetween(0, 256);
        const decoded = encodeAndDecode(BYTE, value, 1);

        expect(decoded).to.equal(value);
    });

    it('should encode and decode an int value', () => {
        const value = randIntBetween(-100, 100);
        const decoded = encodeAndDecode(INT, value, 4);

        expect(decoded).to.equal(value);
    });

    it('should encode and decode a float value', () => {
        const value = randBetween(-100, 100);
        const decoded = encodeAndDecode(FLOAT, value, 4);

        expect(decoded).to.closeTo(value, 0.01);
    });

    it('should encode and decode an empty string value', () => {
        const decoded = encodeAndDecode(STRING, '', 1);

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

        const decoded = encodeAndDecode(STRING, value, length + 1);
        expect(decoded).to.equal(value);
    });
});