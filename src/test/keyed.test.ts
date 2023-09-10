import * as chai from 'chai';
import { encodeAndDecode } from './_mock.test';
import { i32, string } from '../structure/baseTypes';
import { keyed, object, generic, genericEnum, optional } from '../describe';
import { Parsed } from '..';

const expect = chai.expect;

describe('KeyedSchema', () => {
  it('should encode and decode a keyed object, no references', () => {
    const Example = keyed('example', () =>
      object({
        value: i32,
        label: string,
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
    const Example = keyed('example', (Example) =>
      object({
        value: i32,
        label: string,
        next: optional(Example),
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
    const Example = keyed('example', (Example) =>
      object({
        value: i32,
        label: string,
        next: optional(Example),
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
    const Example = keyed('example', (Example) =>
      object({
        value: i32,
        label: string,
        next: optional(Example),
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
    const Example = keyed('example', (Example) =>
      object({
        label: string,
        next: optional(Example),
        tree: keyed('tree', (Tree) =>
          object({
            value: i32,
            child: optional(Tree),
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
    const Example = keyed('example', () =>
      generic(
        {
          label: string,
        },
        {
          primary: object({
            primaryExtra: i32,
          }),
          secondary: object({
            secondaryExtra: i32,
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
    const Example = keyed('example', (Example) =>
      generic(
        {
          label: string,
        },
        {
          continuous: object({
            next: optional(Example),
          }),
          fork: object({
            left: optional(Example),
            right: optional(Example),
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
    const Example = keyed('example', (Example) =>
      genericEnum(
        {},
        {
          0: object({
            next: optional(Example),
          }),
          1: object({
            left: optional(Example),
            right: optional(Example),
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
    const Example = keyed('example', (Example) =>
      genericEnum(
        {
          label: string,
        },
        {
          0: object({
            next: optional(Example),
          }),
          1: object({
            left: optional(Example),
            right: optional(Example),
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
