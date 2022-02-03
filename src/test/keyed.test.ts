import * as chai from 'chai';
import { encodeAndDecode } from './_mock.test';
import { INT, STRING } from '../structure/baseTypes';
import { keyed, object, optional } from '../describe';
import { Parsed } from '..';

const expect = chai.expect;

describe('KeyedSchema', () => {
    it('should encode and decode a keyed object, no references', () => {
        const Example = keyed('example-key' as const, () => object({
            value: INT,
            label: STRING,
        }));

        const value = {
            value: 70,
            label: 'Banana',
        };

        const decoded = encodeAndDecode(Example, value);
        expect(decoded).to.deep.equal(value);
    });

    it('should encode and decode a keyed object, with 0-level-deep references', () => {
        const Example = keyed('example-key' as const, (Example) => object({
            value: INT,
            label: STRING,
            next: optional(Example),
        }));

        const value = {
            value: 70,
            label: 'Banana',
            next: undefined,
        };

        const decoded = encodeAndDecode(Example, value);
        expect(decoded).to.deep.equal(value);
    });

    it('should encode and decode a keyed object, with 1-level-deep references', () => {
        const Example = keyed('example-key' as const, (Example) => object({
            value: INT,
            label: STRING,
            next: optional(Example),
        }));

        const value: Parsed<typeof Example> = {
            value: 70,
            label: 'Banana',
            next: {
                value: 20,
                label: 'Inner Banana',
                next: undefined,
            },
        };

        const decoded = encodeAndDecode(Example, value);
        expect(decoded).to.deep.equal(value);
    });

    it('should encode and decode a keyed object, with 2-level-deep references', () => {
        const Example = keyed('example-key' as const, (Example) => object({
            value: INT,
            label: STRING,
            next: optional(Example),
        }));

        const value: Parsed<typeof Example> = {
            value: 70,
            label: 'Banana',
            next: {
                value: 20,
                label: 'Inner Banana',
                next: {
                    value: 30,
                    label: 'Level-2 Banana',
                    next: undefined,
                },
            },
        };

        const decoded = encodeAndDecode(Example, value);
        expect(decoded).to.deep.equal(value);
    });

    it('should encode and decode a keyed object, with an inner keyed-object', () => {
        const Example = keyed('example-key' as const, (Example) => object({
            label: STRING,
            next: optional(Example),
            tree: keyed('tree' as const, (Tree) => object({
                value: INT,
                child: optional(Tree),
            })),
        }));

        const value: Parsed<typeof Example> = {
            label: 'Banana',
            next: {
                label: 'Inner Banana',
                next: undefined,
                tree: {
                    value: 15,
                    child: undefined,
                },
            },
            tree: {
                value: 21,
                child: {
                    value: 23,
                    child: undefined,
                },
            },
        };

        const decoded = encodeAndDecode(Example, value);
        expect(decoded).to.deep.equal(value);
    });
});
