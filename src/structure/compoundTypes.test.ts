import * as mocha from 'mocha';
import * as chai from 'chai';
import { BufferReader, BufferWriter } from '../io';
import { INT, STRING } from '../describe';
import { CompoundType, readObject, writeObject } from './compoundTypes';
import { BaseType, readSerial, writeSerial } from '.';
import { randIntBetween } from '../../test/random';

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

describe('(read/write)Chars', () => {
    it('should encode and decode fixed-size char array', () => {
        const length = randIntBetween(0, 100);
        let value = '';
        const ranges = [['A', 'Z'], ['a', 'z'], ['0', '9']];
        for (let i = 0; i < length; ++i) {
            const range = ranges[randIntBetween(0, ranges.length) % ranges.length];
            value += String.fromCharCode(randIntBetween(range[0].charCodeAt(0), range[1].charCodeAt(0)));
        }

        const description = { type: CompoundType.CHARS as const, length: value.length };

        const { output, input } = makeIO(length);
        writeSerial({}, output, description, value);
        expect(readSerial({}, input, description)).to.equal(value);
    });
});

describe('(read/write)Array', () => {
    it('should encode and decode a simple int array', () => {
        const length = randIntBetween(0, 5);
        let value = [];
        for (let i = 0; i < length; ++i) {
            value.push(randIntBetween(-10000, 10000));
        }

        const description = { type: CompoundType.ARRAY as const, elementType: { type: BaseType.INT } };

        const { output, input } = makeIO(length * 4 + 4); // Extra 4 bytes for the length of the array
        writeSerial({}, output, description, value);
        expect(readSerial({}, input, description)).to.deep.equal(value);
    });
});

describe('(read/write)Nullable', () => {
    it('should encode and decode a nullable int, with a value', () => {
        const innerValue = randIntBetween(-10000, 10000);

        const description = { type: CompoundType.NULLABLE as const, element: { type: BaseType.INT } };

        const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
        writeSerial({}, output, description, innerValue);
        expect(readSerial({}, input, description)).to.equal(innerValue);
    });

    it('should encode and decode a nullable int, with UNDEFINED value', () => {
        const description = { type: CompoundType.NULLABLE as const, element: { type: BaseType.INT } };

        const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
        writeSerial({}, output, description, undefined);
        expect(readSerial({}, input, description)).to.equal(undefined);
    });
});