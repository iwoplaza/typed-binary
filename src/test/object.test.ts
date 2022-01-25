import * as chai from 'chai';
import { encodeAndDecode, makeIO } from './_mock.test';
import { INT, STRING } from '../structure/baseTypes';
import { generic, genericEnum, object, optional, typedObject, typedGeneric, typedGenericEnum } from '../describe';
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

    it('should treat undefined properties as optional', () => {
        const OptionalString = optional(STRING);
        const schema = object({
            required: STRING,
            optional: OptionalString,
        });

        const valueWithMissing = {
            required: 'Required',
        };

        const valueWithUndefined = {
            required: 'Required',
            optional: undefined,
        };

        expect(encodeAndDecode(schema, valueWithUndefined)).to.deep.equal(valueWithMissing);
        expect(encodeAndDecode(schema, valueWithMissing)).to.deep.equal(valueWithMissing);
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

        expect(input.readInt()).to.equal(1); // a
        expect(input.readInt()).to.equal(3); // c
        expect(input.readInt()).to.equal(2); // b
    });

    it ('allows for type-hints', () => {
        interface Explicit {
            value: number;
            next?: Explicit;
        }

        const schema = typedObject<Explicit>(() => ({
            value: INT,
            next: optional(schema),
        }));

        const value: Explicit = {
            value: 5,
        };

        const decoded = encodeAndDecode(schema, value);
        expect(decoded).to.deep.equal(value);
    });

    it ('allows for generic type-hints', () => {
        interface ExplicitBase {
            base: number;
        }

        interface ExplicitA extends ExplicitBase {
            type: 'a';
            a: string;
        }

        interface ExplicitB extends ExplicitBase {
            type: 'b';
            b: string;
        }

        type Explicit = ExplicitA|ExplicitB;

        const schema = typedGeneric<Explicit>({
            base: INT,
        }, {
            ['a' as const]: object({
                a: STRING,
            }),
            ['b' as const]: object({
                b: STRING,
            }),
        });

        const value = {
            type: 'a' as const,
            base: 15,
            a: 'some',
        };

        const decoded = encodeAndDecode(schema, value);
        expect(decoded).to.deep.equal(value);
    });

    it ('allows for generic enum type-hints', () => {
        interface ExplicitBase {
            base: number;
        }

        interface ExplicitA extends ExplicitBase {
            type: 0;
            a: string;
        }

        interface ExplicitB extends ExplicitBase {
            type: 1;
            b: string;
        }

        type Explicit = ExplicitA|ExplicitB;

        const schema = typedGenericEnum<Explicit>({
            base: INT,
        }, {
            0: object({
                a: STRING,
            }),
            1: object({
                b: STRING,
            }),
        });

        const value = {
            type: 0 as const,
            base: 15,
            a: 'some',
        };

        const decoded = encodeAndDecode(schema, value);
        expect(decoded).to.deep.equal(value);
    });
});
