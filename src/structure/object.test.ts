import * as chai from 'chai';
import { INT, STRING } from '../describe';
import { makeIO } from './_mock.test';
import { writeSerial, readSerial, TypeKey } from '.';

const expect = chai.expect;

describe('(read/write)Object', () => {
    it('should encode and decode a simple object', () => {
        const description = {
            type: TypeKey.OBJECT as const,
            properties: {
                value: INT,
                label: STRING,
            },
        };

        const value = {
            value: 70,
            label: 'Banana',
        };

        const { output, input } = makeIO(64);
        writeSerial({}, output, description, value);
        expect(readSerial({}, input, description)).to.deep.equal(value);
    });

    it('should encode and decode a generic object', () => {
        const genericDescription = {
            type: TypeKey.OBJECT as const,
            subTypeCategory: 'category',
            properties: {
                sharedValue: INT,
            },
        };

        const concreteDescription = {
            type: TypeKey.OBJECT as const,
            subType: 'concrete',
            properties: {
                extraValue: INT,
            },
        };

        const value = {
            subType: 'concrete',
            sharedValue: 100,
            extraValue: 10,
        };

        const context = {
            ['category' as const]: {
                ['concrete' as const]: concreteDescription,
            },
        };
        const { output, input } = makeIO(64);
        // Writing with the generic description.
        writeSerial(context, output, genericDescription, value);
        // Reading with the generic description.
        expect(readSerial(context, input, genericDescription)).to.deep.equal(value);
    });
});