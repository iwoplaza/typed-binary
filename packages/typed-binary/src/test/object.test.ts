import { describe, expect, expectTypeOf, it } from 'vitest';

// Importing from the public API
import bin, { type ISchema, MaxValue, type ObjectSchema } from '../index.ts';
// Helpers
import type { Parsed } from '../utilityTypes.ts';
import { encodeAndDecode, makeIO } from './helpers/mock.ts';

describe('ObjectSchema', () => {
  it('should properly estimate size of max value', () => {
    const description = bin.object({
      value: bin.i32,
      label: bin.byte,
    });

    expect(description.measure(MaxValue).size).to.equal(5);
  });

  it('should encode and decode a simple object', () => {
    const description = bin.object({
      value: bin.i32,
      label: bin.string,
      extra: bin.u32,
    });

    const value = {
      value: 70,
      label: 'Banana',
      extra: 43,
    };

    const { output, input } = makeIO(64);
    description.write(output, value);
    expect(description.read(input)).to.deep.equal(value);
  });

  it('should treat optional properties as undefined', () => {
    const OptionalString = bin.optional(bin.string);
    const schema = bin.object({
      required: bin.string,
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
    const GenericType = bin.generic(
      {
        sharedValue: bin.i32,
      },
      {
        concrete: bin.object({
          extraValue: bin.i32,
        }),
        other: bin.object({
          notImportant: bin.i32,
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
    const GenericType = bin.genericEnum(
      {
        sharedValue: bin.i32,
      },
      {
        0: bin.object({
          extraValue: bin.i32,
        }),
        1: bin.object({
          notImportant: bin.i32,
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
    const schema = bin.object({
      a: bin.i32,
      c: bin.i32,
      b: bin.i32,
    });

    // Purposefully out-of-order.
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
    const schema = bin.object({
      a: bin.i32,
      b: bin.i32,
    });

    const extended = bin.concat([
      schema,
      bin.object({
        c: bin.i32,
        d: bin.i32,
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
    const schema = bin.object({
      a: bin.i32,
      b: bin.i32,
    });

    const prepended = bin.concat([
      bin.object({
        c: bin.i32,
        d: bin.i32,
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

  it('has a type of ISchema with its properties all unwrapped', () => {
    type FlatActual = ObjectSchema<{ a: ISchema<number> }>;
    type FlatExpected = ISchema<{ a: number }>;

    type NestedActual = ObjectSchema<{
      a: ISchema<number>;
      b: ObjectSchema<{ c: ISchema<number> }>;
    }>;
    type NestedExpected = ISchema<{ a: number; b: { c: number } }>;

    expectTypeOf<FlatActual>().toMatchTypeOf<FlatExpected>();
    expectTypeOf<NestedActual>().toMatchTypeOf<NestedExpected>();
  });
});
