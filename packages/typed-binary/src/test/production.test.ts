import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as bin from 'typed-binary';

describe('in production', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('skips checks of how the library is used', () => {
    expect(() => bin.optional('not a schema' as any)).not.toThrow();
    expect(() => bin.orderedEnum('a', 'a')).not.toThrow();
    expect(() => bin.prefixEnum('a', 'ab')).not.toThrow();
    expect(() => bin.inherent(1).write(bin.cursor(new ArrayBuffer(0)), 2 as 1)).not.toThrow();
  });

  it('still checks data being read', () => {
    const Kind = bin.orderedEnum('a', 'b');
    expect(() => Kind.read(bin.cursor(new Uint8Array([5])))).toThrow(bin.ValidationError);

    const Shape = bin.union(bin.u8, { 0: { x: bin.u8 } });
    expect(() => Shape.read(bin.cursor(new Uint8Array([1, 0])))).toThrow(bin.ValidationError);
  });
});
