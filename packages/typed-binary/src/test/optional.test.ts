import { describe, expect, it } from 'vitest';

import { OptionalSchema } from '../structure';
import { i32 } from '../describe';
import { makeIO } from './helpers/mock';
import { randIntBetween } from './random';

describe('OptionalSchema', () => {
  it('should encode and decode an optional int, with a value', () => {
    const innerValue = randIntBetween(-10000, 10000);

    const description = new OptionalSchema(i32);

    const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
    description.write(output, innerValue);
    expect(description.read(input)).to.equal(innerValue);
  });

  it('should encode and decode a nullable int, with UNDEFINED value', () => {
    const description = new OptionalSchema(i32);

    const { output, input } = makeIO(1 + 4); // Extra 1 byte to hold the boolean value.
    description.write(output, undefined);
    expect(description.read(input)).to.equal(undefined);
  });
});
