import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as bin from 'typed-binary';

describe('in production', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('still checks how schemas are defined, with a generic message', () => {
    const shapeError = new bin.InvalidSchemaShapeError('Invalid schema');
    expect(() => bin.optional('not a schema' as any)).toThrow(shapeError);
    expect(() => bin.array('not a schema' as any, 2)).toThrow(shapeError);
    expect(() => bin.concat(['not a struct' as any])).toThrow(shapeError);
    expect(() => bin.orderedEnum('a', 'a')).toThrow(shapeError);
    expect(() => bin.prefixEnum('a', 'ab')).toThrow(shapeError);
  });

  it('still checks data being read', () => {
    const Kind = bin.orderedEnum('a', 'b');
    expect(() => Kind.read(bin.cursor(new Uint8Array([5])))).toThrow(bin.ValidationError);

    const Shape = bin.union(bin.u8, { 0: { x: bin.u8 } });
    expect(() => Shape.read(bin.cursor(new Uint8Array([1, 0])))).toThrow(bin.ValidationError);
  });

  it('still checks values being written or measured, with a generic message', () => {
    const error = new bin.ValidationError('Value does not match its schema');
    const write =
      <T>(schema: bin.Schema<T>, value: T) =>
      () =>
        schema.write(bin.cursor(new ArrayBuffer(8)), value);

    expect(write(bin.array(bin.u8, 2), [1, 2, 3])).toThrow(error);
    expect(write(bin.tuple([bin.u8, bin.u8]), [1] as any)).toThrow(error);
    expect(write(bin.chars(2), 'abc')).toThrow(error);
    expect(write(bin.inherent(1), 2 as 1)).toThrow(error);
    expect(write(bin.orderedEnum('a', 'b'), 'c' as 'a')).toThrow(error);
    expect(write(bin.prefixEnum('a', 'b'), 'c' as 'a')).toThrow(error);
    expect(() => bin.orderedEnum('a', 'b').measure('c' as 'a')).toThrow(error);
    expect(() => bin.prefixEnum('a', 'b').measure('c' as 'a')).toThrow(error);
  });
});
