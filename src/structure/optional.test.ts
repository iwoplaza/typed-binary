import * as chai from 'chai';
import { randIntBetween } from '../test/random';
import { OptionalSchema, INT } from '.';
import { makeIO } from './_mock.test';

const expect = chai.expect;

describe('(read/write)Optiona;', () => {
    it('should encode and decode an optional int, with a value', () => {
        const innerValue = randIntBetween(-10000, 10000);

        const description = new OptionalSchema(INT);

        const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
        description.write(output, innerValue);
        expect(description.read(input)).to.equal(innerValue);
    });

    it('should encode and decode a nullable int, with UNDEFINED value', () => {
        const description = new OptionalSchema(INT);

        const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
        description.write(output, undefined);
        expect(description.read(input)).to.equal(undefined);
    });
});