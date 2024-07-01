import { describe, expectTypeOf, it } from 'vitest';
import type {
  DistributedKeyOf,
  MergeRecordUnion,
  MergeRecords,
} from './utilityTypes';

describe('DistributedKeyOf', () => {
  it('should apply keyof to each union entry separately, then union the results together', () => {
    type Actual = DistributedKeyOf<
      { a: number; b: number } | { a: number; c: number }
    >;

    type Expected = 'a' | 'b' | 'c';

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});

describe('MergeRecords', () => {
  it('should merge a tuple of records', () => {
    type Actual = MergeRecords<
      [{ a: number; b: number }, { a: number; c: number }]
    >;

    type Expected = { a: number; b: number; c: number };

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});

describe('MergeRecordUnion', () => {
  it('should merge a union of two records', () => {
    type Actual = MergeRecordUnion<
      { a: number; b: number } | { a: number; c: number }
    >;

    type Expected = { a: number; b: number; c: number };

    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});
