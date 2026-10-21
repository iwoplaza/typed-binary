import { describe, expect, expectTypeOf, it } from 'vitest';
import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('unbounded max size', () => {
  it('propagates through containers', () => {
    expect(bin.struct({ a: bin.i32, b: bin.string, c: bin.i32 }).maxSize).toBeNaN();
    expect(bin.optional(bin.string).measure(bin.MaxValue).size).toBeNaN();
    expect(bin.tuple([bin.i32, bin.string]).maxSize).toBeNaN();
  });

  it('does not treat a schema reused in sibling properties as recursive', () => {
    const Vec = bin.tuple([bin.f32, bin.f32]);
    expect(bin.struct({ a: Vec, b: Vec }).maxSize).toEqual(16);
  });
});

describe('recursive struct', () => {
  const List = bin.struct({
    value: bin.i32,
    get next() {
      return bin.optional(List);
    },
  });

  it('has an unbounded max size', () => {
    expect(List.maxSize).toBeNaN();
  });

  it('measures concrete values', () => {
    const value = { value: 1, next: { value: 2, next: undefined } };
    expect(List.measure(value).size).toEqual(4 + 1 + 4 + 1);
    expect(encodeAndDecode(List, value)).toEqual(value);
  });
});

describe('recursive pipe', () => {
  it('works with a getter inside the returned schema', () => {
    const Expr = bin.pipe(bin.struct({ type: bin.orderedEnum('lit', 'neg') }), (v) =>
      v !== bin.MaxValue && v.type === 'lit'
        ? bin.struct({ type: bin.inherent('lit'), value: bin.i32 })
        : bin.struct({
            type: bin.inherent('neg'),
            get inner() {
              return Expr;
            },
          }),
    );
    type Expr = bin.ExtractOut<typeof Expr>;

    expectTypeOf<Expr>().not.toBeAny();
    expectTypeOf<Extract<Expr, { type: 'neg' }>['inner']>().toEqualTypeOf<Expr>();

    const value: Expr = { type: 'neg', inner: { type: 'lit', value: 7 } };
    expect(encodeAndDecode(Expr, value)).toEqual(value);
    expect(Expr.maxSize).toBeNaN();
  });

  it('works with top-level variants that reference it through getters', () => {
    const Lit = bin.struct({ type: bin.inherent('lit'), value: bin.i32 });
    const Mul = bin.struct({
      type: bin.inherent('mul'),
      get a() {
        return Expr;
      },
      get b() {
        return Expr;
      },
    });
    const Expr = bin.pipe(bin.struct({ type: bin.orderedEnum('lit', 'mul') }), (v) =>
      v === bin.MaxValue || v.type === 'mul' ? Mul : Lit,
    );
    type Expr = bin.ExtractOut<typeof Expr>;

    expectTypeOf<Expr>().not.toBeAny();
    expectTypeOf<Extract<Expr, { type: 'mul' }>['a']>().toEqualTypeOf<Expr>();

    const value: Expr = {
      type: 'mul',
      a: { type: 'lit', value: 2 },
      b: { type: 'mul', a: { type: 'lit', value: 3 }, b: { type: 'lit', value: 4 } },
    };
    expect(Expr.measure(value).size).toEqual(1 + (1 + 4) + (1 + (1 + 4) + (1 + 4)));
    expect(encodeAndDecode(Expr, value)).toEqual(value);
    expect(Expr.maxSize).toBeNaN();
  });
});
