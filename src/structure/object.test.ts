import * as chai from 'chai';
import { makeIO } from './_mock.test';
import { ObjectSchema } from './object';
import { INT, STRING } from './baseTypes';
import { GenericObjectSchema } from './_internal';
import { SubTypeKey } from '.';

const expect = chai.expect;

describe('(read/write)Object', () => {
    it('should encode and decode a simple object', () => {
        const description = new ObjectSchema({
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
        const genericDescription = new GenericObjectSchema(SubTypeKey.STRING, {
            sharedValue: INT,
        }, {
            'concrete': new ObjectSchema({
                extraValue: INT,
            }),
        });

        const value = {
            subType: 'concrete' as const,
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
        const genericDescription = new GenericObjectSchema(SubTypeKey.ENUM, {
            sharedValue: INT,
        }, {
            0: new ObjectSchema({
                extraValue: INT,
            }),
        });

        const value = {
            subType: 0 as const,
            sharedValue: 100,
            extraValue: 10,
        };

        const { output, input } = makeIO(64);
        // Writing with the generic description.
        genericDescription.write(output, value);
        // Reading with the generic description.
        expect(genericDescription.read(input)).to.deep.equal(value);
    });
});
