import { describe, expect, expectTypeOf, it } from 'vitest';

import bin from 'typed-binary';
import { encodeAndDecode, makeIO } from './helpers/mock.ts';

describe('bin.struct', () => {
  it('should properly estimate size of max value', () => {
    const description = bin.struct({
      value: bin.i32,
      label: bin.u8,
    });

    expect(description.measure(bin.MaxValue).size).toEqual(5);
  });

  it('should encode and decode a simple object', () => {
    const description = bin.struct({
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
    const schema = bin.struct({
      required: bin.string,
      optional: OptionalString,
    });

    const valueWithUndefined = {
      required: 'Required',
      optional: undefined,
    };

    expect(encodeAndDecode(schema, valueWithUndefined)).to.deep.equal(valueWithUndefined);
  });

  it('should encode and decode a generic object', () => {
    type GenericType = bin.ExtractOut<typeof GenericType>;
    const GenericType = bin.generic(
      {
        sharedValue: bin.i32,
      },
      {
        concrete: {
          extraValue: bin.i32,
        },
        other: {
          notImportant: bin.i32,
        },
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
    type GenericType = bin.ExtractOut<typeof GenericType>;
    const GenericType = bin.genericEnum(
      {
        sharedValue: bin.i32,
      },
      {
        0: {
          extraValue: bin.i32,
        },
        1: {
          notImportant: bin.i32,
        },
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
    const schema = bin.struct({
      a: bin.i32,
      c: bin.i32,
      b: bin.i32,
    });

    // Purposefully out-of-order.
    const value: bin.ExtractOut<typeof schema> = {
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
    const schema = bin.struct({
      a: bin.i32,
      b: bin.i32,
    });

    const extended = bin.concat([
      schema,
      bin.struct({
        c: bin.i32,
        d: bin.i32,
      }),
    ]);

    const value: bin.ExtractOut<typeof extended> = {
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
    const schema = bin.struct({
      a: bin.i32,
      b: bin.i32,
    });

    const prepended = bin.concat([
      bin.struct({
        c: bin.i32,
        d: bin.i32,
      }),
      schema,
    ]);

    const value: bin.ExtractOut<typeof prepended> = {
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

  it('is assignable to AnySchema', () => {
    const schema = bin.struct({ a: bin.i32 });

    function acceptsAny(_s: bin.Schema) {}

    acceptsAny(schema);

    expectTypeOf(schema).toEqualTypeOf<bin.Struct<{ a: bin.Int32 }>>();
    expectTypeOf(schema).toExtend<bin.Schema>();
  });

  it('is not assignable to a wider or narrower schema', () => {
    const schema = bin.struct({ a: bin.i32, b: bin.i32 });

    function wider(_s: bin.Struct<{ a: bin.Int32 }>) {}
    function narrower(_s: bin.Struct<{ a: bin.Int32; b: bin.Int32; c: bin.Int32 }>) {}

    // @ts-expect-error
    wider(schema);

    // @ts-expect-error
    narrower(schema);
  });

  it('can be recursive', () => {
    const Example = bin.struct({
      value: bin.i32,
      label: bin.string,
      get next() {
        return bin.optional(Example);
      },
    });

    const value: bin.ExtractOut<typeof Example> = {
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
});
