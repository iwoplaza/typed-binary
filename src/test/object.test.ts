import * as chai from 'chai';
import { makeIO } from './_mock.test';
import { INT, STRING } from '../structure/baseTypes';
import { generic, genericEnum, object } from '../describe';
import { Parsed } from '../utilityTypes';

const expect = chai.expect;

describe('ObjectSchema', () => {
    it('should encode and decode a simple object', () => {
        const description = object({
            value: INT,
            label: STRING,
        });

        const value = {
            value: 70,
            label: 'Banana',
        };

        const { output, input } = makeIO(64);
        description.write(output, value);
        expect(description.read(input)).to.deep.equal(value);
    });

    it('should encode and decode a generic object', () => {
        const genericDescription =
            generic({
                sharedValue: INT,
            }, {
                'concrete': object({
                    extraValue: INT,
                }),
            });

        const value = {
            type: 'concrete' as const,
            sharedValue: 100,
            extraValue: 10,
        };

        const { output, input } = makeIO(64);
        // Writing with the generic description.
        genericDescription.write(output, value);
        // Reading with the generic description.
        expect(genericDescription.read(input)).to.deep.equal(value);
    });

    it('should encode and decode an enum generic object', () => {
        const genericDescription =
            genericEnum({
                sharedValue: INT,
            }, {
                0: object({
                    extraValue: INT,
                }),
            });

        const value = {
            type: 0 as const,
            sharedValue: 100,
            extraValue: 10,
        };

        const { output, input } = makeIO(64);
        // Writing with the generic description.
        genericDescription.write(output, value);
        // Reading with the generic description.
        expect(genericDescription.read(input)).to.deep.equal(value);
    });

    it('preserves insertion-order of properties', () => {
        const schema = object({
            a: INT,
            c: INT,
            b: INT,
        });

        // Purpusefully out-of-order.
        const value: Parsed<typeof schema> = {
            a: 1,
            b: 2,
            c: 3,
        };

        const { output, input } = makeIO(schema.sizeOf(value));
        schema.write(output, value);

        expect(input.readInt() === 1); // a
        expect(input.readInt() === 3); // c
        expect(input.readInt() === 2); // b
    });
});
