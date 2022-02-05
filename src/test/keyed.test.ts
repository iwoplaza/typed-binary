import * as chai from 'chai';
import { encodeAndDecode } from './_mock.test';
import { INT, STRING } from '../structure/baseTypes';
import { keyed, object, generic, optional } from '../describe';
import { Parsed } from '..';

const expect = chai.expect;

describe('KeyedSchema', () => {
    it('should encode and decode a keyed object, no references', () => {
        const Example = keyed('example', () => object({
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
        const Example = keyed('example', (Example) => object({
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
        const Example = keyed('example', (Example) => object({
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
        const Example = keyed('example', (Example) => object({
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
        type Example = Parsed<typeof Example>;
        const Example = keyed('example', (Example) => object({
            label: STRING,
            next: optional(Example),
            tree: keyed('tree', (Tree) => object({
                value: INT,
                child: optional(Tree),
            })),
        }));

        const value: Example = {
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

    it('should encode and decode a keyed generic object, no references', () => {
        type Example = Parsed<typeof Example>;
        const Example = keyed('example', () => generic({
            label: STRING,
        }, {
            primary: object({
                primaryExtra: INT,
            }),
            secondary: object({
                secondaryExtra: INT,
            })
        }));

        const value: Example = {
            label: 'Example Label',
            type: 'primary',
            primaryExtra: 15,
        };

        const decoded = encodeAndDecode(Example, value);
        expect(decoded).to.deep.equal(value);
    });

    it('should encode and decode a keyed generic object, with references', () => {
        type Example = Parsed<typeof Example>;
        const Example = keyed('example', (Example) => generic({
            label: STRING,
        }, {
            continuous: object({
                next: optional(Example),
            }),
            fork: object({
                left: optional(Example),
                right: optional(Example),
            })
        }));

        const value: Example = {
            label: 'Root',
            type: 'continuous',
            next: {
                label: 'Level 1',
                type: 'fork',
                left: {
                    label: 'Level 2-A',
                    type: 'continuous',
                    next: undefined,
                },
                right: {
                    label: 'Level 2-B',
                    type: 'continuous',
                    next: undefined,
                },
            },
        };

        const decoded = encodeAndDecode(Example, value);
        expect(decoded).to.deep.equal(value);
    });
});
