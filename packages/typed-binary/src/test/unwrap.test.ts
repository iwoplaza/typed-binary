import { describe, expectTypeOf, it } from 'vitest';

// Importing from the public API
import type {
  IKeyedSchema,
  ISchema,
  Unwrap,
  UnwrapArray,
  UnwrapRecord,
} from '../index.ts';

describe('Unwrap<T>', () => {
  it('unwraps one level of wrapping properly', () => {
    type Actual = Unwrap<ISchema<ISchema<string>>>;
    type Expected = ISchema<string>;

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('unwraps ONLY one level of wrapping', () => {
    type Actual = Unwrap<ISchema<ISchema<ISchema<number>>>>;
    type Expected = ISchema<ISchema<number>>;

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('bypasses keyed schemas', () => {
    type Actual = Unwrap<IKeyedSchema<'abc', ISchema<ISchema<number>>>>;
    type Expected = IKeyedSchema<'abc', ISchema<number>>;

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('ignores if topmost wrapper (ignoring keyed schemas) is not a schema (record)', () => {
    type Inner = { abc: ISchema<ISchema<number>> };
    type Actual = Unwrap<Inner>;

    expectTypeOf<Actual>().toEqualTypeOf<Inner>();
  });

  it('ignores if topmost wrapper (ignoring keyed schemas) is not a schema (tuple)', () => {
    type Inner = [ISchema<string>, ISchema<number>];
    type Actual = Unwrap<Inner>;

    expectTypeOf<Actual>().toEqualTypeOf<Inner>();
  });
});

describe('UnwrapRecord<T>', () => {
  it('unwraps one level of wrapping of direct properties', () => {
    type Actual = UnwrapRecord<{
      a: ISchema<ISchema<string>>;
      b: ISchema<number>;
    }>;
    type Expected = { a: ISchema<string>; b: number };

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('bypasses keyed schema at the top level', () => {
    type Actual = UnwrapRecord<
      IKeyedSchema<
        'xyz',
        {
          a: ISchema<ISchema<string>>;
          b: ISchema<number>;
        }
      >
    >;
    type Expected = IKeyedSchema<'xyz', { a: ISchema<string>; b: number }>;

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('bypasses keyed schema at the property level', () => {
    type Actual = UnwrapRecord<{
      a: IKeyedSchema<'xyz', ISchema<ISchema<string>>>;
      b: IKeyedSchema<'abc', ISchema<number>>;
    }>;
    type Expected = {
      a: IKeyedSchema<'xyz', ISchema<string>>;
      b: IKeyedSchema<'abc', number>;
    };

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('bypasses keyed schema at both levels', () => {
    type Actual = IKeyedSchema<
      'top',
      UnwrapRecord<{
        a: IKeyedSchema<'xyz', ISchema<ISchema<string>>>;
        b: IKeyedSchema<'abc', ISchema<number>>;
      }>
    >;
    type Expected = IKeyedSchema<
      'top',
      {
        a: IKeyedSchema<'xyz', ISchema<string>>;
        b: IKeyedSchema<'abc', number>;
      }
    >;

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});

describe('UnwrapArray<T>', () => {
  it('unwraps one level of wrapping of ISchema<string>[]', () => {
    type Actual = UnwrapArray<ISchema<string>[]>;
    type Expected = string[];

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('unwraps one level of wrapping of [ISchema<string>, number>', () => {
    type Actual = UnwrapArray<[ISchema<string>, number]>;
    type Expected = [string, number];

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it('bypasses keyed schema at the top level (simple array)', () => {
    type Actual = UnwrapArray<IKeyedSchema<'xyz', ISchema<number>[]>>;
    type Expected = IKeyedSchema<'xyz', number[]>;

    expectTypeOf<Actual>().toMatchTypeOf<Expected>();
  });

  it('bypasses keyed schema at the top level (tuple)', () => {
    type Actual = UnwrapArray<
      IKeyedSchema<'xyz', [ISchema<ISchema<number>>, ISchema<string>]>
    >;
    type Expected = IKeyedSchema<'xyz', [ISchema<number>, string]>;

    expectTypeOf<Actual>().toMatchTypeOf<Expected>();
  });
});
