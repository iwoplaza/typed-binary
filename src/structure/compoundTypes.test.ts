import * as mocha from 'mocha';
import * as chai from 'chai';
import { BufferReader, BufferWriter } from '../io';
import { INT, STRING } from '../describe';
import { CompoundType, readObject, writeObject } from './compoundTypes';
import { readSerial, writeSerial } from '.';

function makeIO(bufferSize: number) {
    const buffer = new ArrayBuffer(bufferSize);
    return {
        output: new BufferWriter(buffer),
        input: new BufferReader(buffer),
    };
}

const expect = chai.expect;
describe('(read/write)Object', () => {
    it('should encode and decode a simple object', () => {
        const description = {
            type: CompoundType.OBJECT as const,
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
        writeObject({}, output, description, value);
        expect(readObject({}, input, description)).to.deep.equal(value);
    });

    it('should encode and decode a generic object', () => {
        const genericDescription = {
            type: CompoundType.OBJECT as const,
            subTypeCategory: 'category',
            properties: {
                sharedValue: INT,
            },
        };

        const concreteDescription = {
            type: CompoundType.OBJECT as const,
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