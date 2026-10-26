import { describe, expect, it } from 'vitest';

import * as bin from 'typed-binary';
import { makeIO } from './helpers/mock.ts';

describe('bin.optional', () => {
  it('should encode and decode an optional int, with a value', () => {
    const innerValue = -1234;

    const description = bin.optional(bin.i32);

    const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
    description.write(output, innerValue);
    expect(description.read(input)).to.equal(innerValue);
  });

  it('should encode and decode a nullable int, with UNDEFINED value', () => {
    const description = bin.optional(bin.i32);

    const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
    description.write(output, undefined);
    expect(description.read(input)).to.equal(undefined);
  });
});
