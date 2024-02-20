import { describe, it, expect } from 'vitest';

import { bool, i32, MaxValue } from '../structure';
import { tupleOf } from '../describe';
import { encodeAndDecode } from './helpers/mock';

describe('TupleSchema', () => {
  it('should estimate an [i32, bool] encoding size', () => {
    const Schema = tupleOf([i32, bool]);

    expect(Schema.measure([123, false]).size).toEqual(
      i32.measure(MaxValue).size + bool.measure(MaxValue).size,
    );
  });

  it('should properly estimate size of max value', () => {
    const Schema = tupleOf([i32, bool]);

    expect(Schema.measure(MaxValue).size).toEqual(
      i32.measure(MaxValue).size + bool.measure(MaxValue).size,
    );
  });

  it('should encode and decode [i32, bool]', () => {
    const Schema = tupleOf([i32, bool]);

    expect(encodeAndDecode(Schema, [123, false])).toEqual([123, false]);
  });
});
