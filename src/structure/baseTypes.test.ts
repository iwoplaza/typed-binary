import * as mocha from 'mocha';
import * as chai from 'chai';
import { randBetween, randIntBetween } from '../../test/random';
import { BufferReader, BufferWriter } from '../io';
import { TypeKey, writeSerial, readSerial } from '.';
import type { BaseTypeDescription, BaseTypeMap } from '.';


function encodeAndDecode<T extends BaseTypeDescription>(description: T, value: BaseTypeMap[T['type']], bufferSize: number): BaseTypeMap[T['type']] {
    const buffer = new ArrayBuffer(bufferSize);
    const bufferWriter = new BufferWriter(buffer);
    writeSerial<BaseTypeDescription>({}, bufferWriter, description, value);

    const bufferReader = new BufferReader(buffer);
    return readSerial<BaseTypeDescription>({}, bufferReader, description) as BaseTypeMap[T['type']];
}

const expect = chai.expect;
describe('(read/write)BaseType', () => {
    it('should encode and decode a bool value', () => {
        const description = { type: TypeKey.BOOL as const };
        const value = Math.random() < 0.5;
        const decoded = encodeAndDecode(description, value, 1);

        expect(decoded).to.equal(value);
    });

    it('should encode and decode a byte value', () => {
        const description = { type: TypeKey.BYTE as const };
        const value = randIntBetween(0, 256);
        const decoded = encodeAndDecode(description, value, 1);

        expect(decoded).to.equal(value);
    });

    it('should encode and decode an int value', () => {
        const description = { type: TypeKey.INT as const };
        const value = randIntBetween(-100, 100);
        const decoded = encodeAndDecode(description, value, 4);

        expect(decoded).to.equal(value);
    });

    it('should encode and decode a float value', () => {
        const description = { type: TypeKey.FLOAT as const };
        const value = randBetween(-100, 100);
        const decoded = encodeAndDecode(description, value, 4);

        expect(decoded).to.closeTo(value, 0.01);
    });

    it('should encode and decode an empty string value', () => {
        const description = { type: TypeKey.STRING as const };
        const decoded = encodeAndDecode(description, '', 1);

        expect(decoded).to.equal('');
    });

    it('should encode and decode an alphanumerical string', () => {
        const description = { type: TypeKey.STRING as const };
        const length = randIntBetween(0, 100);
        let value = '';
        const ranges = [['A', 'Z'], ['a', 'z'], ['0', '9']];
        for (let i = 0; i < length; ++i) {
            const range = ranges[randIntBetween(0, ranges.length) % ranges.length];
            value += String.fromCharCode(randIntBetween(range[0].charCodeAt(0), range[1].charCodeAt(0)));
        }

        const decoded = encodeAndDecode(description, value, length + 1);
        expect(decoded).to.equal(value);
    });
});