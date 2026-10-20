import { describe, expect, expectTypeOf, it } from 'vitest';
import * as bin from 'typed-binary';
import { encodeAndDecode, makeIO } from './helpers/mock.ts';

describe('bin.prefixEnum', () => {
  it('encodes and decodes values', () => {
    const Kind = bin.prefixEnum('multiply', 'negate', 'int_literal');
    expectTypeOf<bin.ExtractOut<typeof Kind>>().toEqualTypeOf<
      'multiply' | 'negate' | 'int_literal'
    >();
    expect(encodeAndDecode(Kind, 'negate')).toEqual('negate');
    expect(Kind.measure('negate').size).toEqual('negate'.length);
    expect(Kind.measure(bin.MaxValue).size).toEqual('int_literal'.length);
  });

  it('rejects values that are prefixes of each other', () => {
    expect(() => bin.prefixEnum('a', 'ab')).toThrow();
  });

  it('rejects duplicate values', () => {
    expect(() => bin.prefixEnum('a', 'a')).toThrow();
  });

  it('rejects non-ASCII values', () => {
    expect(() => bin.prefixEnum('ok', 'größe')).toThrow(/ASCII/);
    expect(() => bin.prefixEnum('€')).toThrow(/ASCII/);
    expect(() => bin.prefixEnum('🐶')).toThrow(/ASCII/);
  });

  it('encodes each character as a single byte', () => {
    const Kind = bin.prefixEnum('ab', 'c~');
    const { output, input } = makeIO(2);
    Kind.write(output, 'c~');
    expect(input.readUint8()).toEqual('c'.charCodeAt(0));
    expect(input.readUint8()).toEqual('~'.charCodeAt(0));
  });
});

describe('bin.orderedEnum', () => {
  it('encodes values as their index', () => {
    const Kind = bin.orderedEnum('multiply', 'negate', 'int_literal');
    expectTypeOf<bin.ExtractOut<typeof Kind>>().toEqualTypeOf<
      'multiply' | 'negate' | 'int_literal'
    >();

    const { output, input } = makeIO(1);
    Kind.write(output, 'int_literal');
    expect(input.readUint8()).toEqual(2);

    expect(encodeAndDecode(Kind, 'negate')).toEqual('negate');
    expect(Kind.measure('negate').size).toEqual(1);
    expect(Kind.maxSize).toEqual(1);
  });

  it('allows values that are prefixes of each other', () => {
    const Kind = bin.orderedEnum('a', 'ab');
    expect(encodeAndDecode(Kind, 'a')).toEqual('a');
    expect(encodeAndDecode(Kind, 'ab')).toEqual('ab');
  });

  it('rejects duplicate values', () => {
    expect(() => bin.orderedEnum('a', 'a')).toThrow();
  });

  it('rejects unknown values and indices', () => {
    const Kind = bin.orderedEnum('a', 'b');
    // @ts-expect-error
    expect(() => Kind.measure('c')).toThrow();

    const { output, input } = makeIO(1);
    output.writeUint8(2);
    expect(() => Kind.read(input)).toThrow();
  });
});
