import * as chai from 'chai';
import { readSerial, writeSerial, TypeKey } from '.';
import { randIntBetween } from '../../test/random';
import { makeIO } from './_mock.test';

const expect = chai.expect;

describe('(read/write)Nullable', () => {
    it('should encode and decode a nullable int, with a value', () => {
        const innerValue = randIntBetween(-10000, 10000);

        const description = { type: TypeKey.NULLABLE as const, element: { type: TypeKey.INT as const } };

        const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
        writeSerial({}, output, description, innerValue);
        expect(readSerial({}, input, description)).to.equal(innerValue);
    });

    it('should encode and decode a nullable int, with UNDEFINED value', () => {
        const description = { type: TypeKey.NULLABLE as const, element: { type: TypeKey.INT as const } };

        const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
        writeSerial({}, output, description, undefined);
        expect(readSerial({}, input, description)).to.equal(undefined);
    });
});