import { describe, expect, expectTypeOf, it } from 'vitest';

import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';
import { ExtractOut } from '../index.ts';

describe('bin.tuple', () => {
  it('should estimate an [i32, bool] encoding size', () => {
    const Schema = bin.tuple([bin.i32, bin.bool]);

    expect(Schema.measure([123, false])).toEqual(
      bin.i32.measure(bin.MaxValue) + bin.bool.measure(bin.MaxValue),
    );
  });

  it('should properly estimate size of max value', () => {
    const Schema = bin.tuple([bin.i32, bin.bool]);

    expect(Schema.measure(bin.MaxValue)).toEqual(
      bin.i32.measure(bin.MaxValue) + bin.bool.measure(bin.MaxValue),
    );
  });

  it('should encode and decode [i32, bool]', () => {
    const Schema = bin.tuple([bin.i32, bin.bool]);

    expect(encodeAndDecode(Schema, [123, false])).toEqual([123, false]);
  });

  it('can be recursive', () => {
    const Foo = bin.tuple([
      bin.struct({
        a: bin.f32,
        get next() {
          return bin.dynamicArray(Foo);
        },
      }),
    ]);

    expectTypeOf<ExtractOut<typeof Foo>[0]['next'][number]>().toEqualTypeOf<
      ExtractOut<typeof Foo>
    >();
  });
});
