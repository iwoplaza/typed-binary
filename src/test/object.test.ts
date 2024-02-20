import { describe, it, expect } from 'vitest';

import { encodeAndDecode, makeIO } from './helpers/mock';
import { concat, generic, genericEnum, object, optional } from '../describe';
import { byte, i32, string, MaxValue } from '../structure';
import { Parsed } from '../utilityTypes';

describe('ObjectSchema', () => {
  it('should properly estimate size of max value', () => {
    const description = object({
      value: i32,
      label: byte,
    });

    expect(description.measure(MaxValue).size).to.equal(5);
  });

  it('should encode and decode a simple object', () => {
    const description = object({
      value: i32,
      label: string,
    });

    const value = {
      value: 70,
      label: 'Banana',
    };

    const { output, input } = makeIO(64);
    description.write(output, value);
    expect(description.read(input)).to.deep.equal(value);
  });

  it('should treat optional properties as undefined', () => {
    const OptionalString = optional(string);
    const schema = object({
      required: string,
      optional: OptionalString,
    });

    const valueWithUndefined = {
      required: 'Required',
      optional: undefined,
    };

    expect(encodeAndDecode(schema, valueWithUndefined)).to.deep.equal(
      valueWithUndefined,
    );
  });

  it('should encode and decode a generic object', () => {
    type GenericType = Parsed<typeof GenericType>;
    const GenericType = generic(
      {
        sharedValue: i32,
      },
      {
        concrete: object({
          extraValue: i32,
        }),
        other: object({
          notImportant: i32,
        }),
      },
    );

    const value: GenericType = {
      type: 'concrete' as const,
      sharedValue: 100,
      extraValue: 10,
    };

    const { output, input } = makeIO(64);
    // Writing with the generic description.
    GenericType.write(output, value);
    // Reading with the generic description.
    expect(GenericType.read(input)).to.deep.equal(value);
  });

  it('should encode and decode an enum generic object', () => {
    type GenericType = Parsed<typeof GenericType>;
    const GenericType = genericEnum(
      {
        sharedValue: i32,
      },
      {
        0: object({
          extraValue: i32,
        }),
        1: object({
          notImportant: i32,
        }),
      },
    );

    const value: GenericType = {
      type: 0 as const,
      sharedValue: 100,
      extraValue: 10,
    };

    const { output, input } = makeIO(64);
    // Writing with the generic description.
    GenericType.write(output, value);
    // Reading with the generic description.
    expect(GenericType.read(input)).to.deep.equal(value);
  });

  it('preserves insertion-order of properties', () => {
    const schema = object({
      a: i32,
      c: i32,
      b: i32,
    });

    // Purpusefully out-of-order.
    const value: Parsed<typeof schema> = {
      a: 1,
      b: 2,
      c: 3,
    };

    const { output, input } = makeIO(schema.measure(value).size);
    schema.write(output, value);

    expect(input.readInt32()).to.equal(1); // a
    expect(input.readInt32()).to.equal(3); // c
    expect(input.readInt32()).to.equal(2); // b
  });

  it('allows to extend it with more properties', () => {
    const schema = object({
      a: i32,
      b: i32,
    });

    const extended = concat([
      schema,
      object({
        c: i32,
        d: i32,
      }),
    ]);

    const value: Parsed<typeof extended> = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };

    const { output, input } = makeIO(extended.measure(value).size);
    extended.write(output, value);

    expect(input.readInt32()).to.equal(1); // a
    expect(input.readInt32()).to.equal(2); // b
    expect(input.readInt32()).to.equal(3); // c
    expect(input.readInt32()).to.equal(4); // d
  });

  it('allows to prepend it with more properties', () => {
    const schema = object({
      a: i32,
      b: i32,
    });

    const prepended = concat([
      object({
        c: i32,
        d: i32,
      }),
      schema,
    ]);

    const value: Parsed<typeof prepended> = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };

    const { output, input } = makeIO(prepended.measure(value).size);
    prepended.write(output, value);

    expect(input.readInt32()).to.equal(3); // c
    expect(input.readInt32()).to.equal(4); // d
    expect(input.readInt32()).to.equal(1); // a
    expect(input.readInt32()).to.equal(2); // b
  });
});
