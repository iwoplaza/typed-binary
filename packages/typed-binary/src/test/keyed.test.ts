import { describe, expect, it } from 'vitest';

// Importing from the public API
import bin from '../index.ts';
// Helpers
import type { Parsed } from '../utilityTypes.ts';
import { encodeAndDecode } from './helpers/mock.ts';

describe('KeyedSchema', () => {
  it('should encode and decode a keyed object, no references', () => {
    const Example = bin.keyed('example', () =>
      bin.object({
        value: bin.i32,
        label: bin.string,
      }),
    );

    const value = {
      value: 70,
      label: 'Banana',
    };

    const decoded = encodeAndDecode(Example, value);
    expect(decoded).to.deep.equal(value);
  });

  it('should encode and decode a keyed object, with 0-level-deep references', () => {
    const Example = bin.keyed('example', (Example) =>
      bin.object({
        value: bin.i32,
        label: bin.string,
        next: bin.optional(Example),
      }),
    );

    const value = {
      value: 70,
      label: 'Banana',
      next: undefined,
    };

    const decoded = encodeAndDecode(Example, value);
    expect(decoded).to.deep.equal(value);
  });

  it('should encode and decode a keyed object, with 1-level-deep references', () => {
    const Example = bin.keyed('example', (Example) =>
      bin.object({
        value: bin.i32,
        label: bin.string,
        next: bin.optional(Example),
      }),
    );

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
    const Example = bin.keyed('example', (Example) =>
      bin.object({
        value: bin.i32,
        label: bin.string,
        next: bin.optional(Example),
      }),
    );

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
    const Example = bin.keyed('example', (Example) =>
      bin.object({
        label: bin.string,
        next: bin.optional(Example),
        tree: bin.keyed('tree', (Tree) =>
          bin.object({
            value: bin.i32,
            child: bin.optional(Tree),
          }),
        ),
      }),
    );

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
    const Example = bin.keyed('example', () =>
      bin.generic(
        {
          label: bin.string,
        },
        {
          primary: bin.object({
            primaryExtra: bin.i32,
          }),
          secondary: bin.object({
            secondaryExtra: bin.i32,
          }),
        },
      ),
    );

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
    const Example = bin.keyed('example', (Example) =>
      bin.generic(
        {
          label: bin.string,
        },
        {
          continuous: bin.object({
            next: bin.optional(Example),
          }),
          fork: bin.object({
            left: bin.optional(Example),
            right: bin.optional(Example),
          }),
        },
      ),
    );

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

  it('should encode and decode a keyed enum generic object, no base props, with references', () => {
    type Example = Parsed<typeof Example>;
    const Example = bin.keyed('example', (Example) =>
      bin.genericEnum(
        {},
        {
          0: bin.object({
            next: bin.optional(Example),
          }),
          1: bin.object({
            left: bin.optional(Example),
            right: bin.optional(Example),
          }),
        },
      ),
    );

    const value: Example = {
      type: 0,
      next: {
        type: 1,
        left: {
          type: 0,
          next: undefined,
        },
        right: {
          type: 0,
          next: undefined,
        },
      },
    };

    const decoded = encodeAndDecode(Example, value);
    expect(decoded).to.deep.equal(value);
  });

  it('should encode and decode a keyed enum generic object, with references', () => {
    type Example = Parsed<typeof Example>;
    const Example = bin.keyed('example', (Example) =>
      bin.genericEnum(
        {
          label: bin.string,
        },
        {
          0: bin.object({
            next: bin.optional(Example),
          }),
          1: bin.object({
            left: bin.optional(Example),
            right: bin.optional(Example),
          }),
        },
      ),
    );

    const value: Example = {
      label: 'Root',
      type: 0,
      next: {
        label: 'Level 1',
        type: 1,
        left: {
          label: 'Level 2-A',
          type: 0,
          next: undefined,
        },
        right: {
          label: 'Level 2-B',
          type: 0,
          next: undefined,
        },
      },
    };

    const decoded = encodeAndDecode(Example, value);
    expect(decoded).to.deep.equal(value);
  });
});
