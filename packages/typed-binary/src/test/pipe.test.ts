import { describe, expect, expectTypeOf, it } from 'vitest';
import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

describe('bin.pipe', () => {
  const Foo = bin.pipe(
    bin.struct({
      length: bin.u8,
    }),
    (value) => {
      // Accounting for the biggest possible value
      const length = value === bin.MaxValue ? 255 : value.length;

      return bin.struct({
        length: bin.inherent(length),
        data: bin.array(bin.f32, length),
      });
    },
  );

  it('encodes and decodes data dependent on the head', () => {
    const value: bin.ExtractOut<typeof Foo> = { length: 2, data: [0.5, 0.25] };
    expect(Foo.measure(value)).toEqual(1 + 2 * 4);
    expect(encodeAndDecode(Foo, value)).toEqual(value);
  });

  it('measures the max size by passing MaxValue to the action', () => {
    expect(Foo.maxSize).toEqual(1 + 255 * 4);
  });

  it('infers the output of the tail', () => {
    expectTypeOf<bin.ExtractOut<typeof Foo>>().toEqualTypeOf<{ length: number; data: number[] }>();
  });

  it('can replace generic objects', () => {
    const Shape = bin.pipe(bin.struct({ type: bin.prefixEnum('circle', 'rect') }), (value) => {
      if (value === bin.MaxValue || value.type === 'rect') {
        return bin.struct({ type: bin.inherent('rect'), w: bin.f32, h: bin.f32 });
      }
      return bin.struct({ type: bin.inherent('circle'), r: bin.f32 });
    });

    expectTypeOf<bin.ExtractOut<typeof Shape>>().toEqualTypeOf<
      { type: 'rect'; w: number; h: number } | { type: 'circle'; r: number }
    >();

    expect(encodeAndDecode(Shape, { type: 'circle', r: 2 })).toEqual({ type: 'circle', r: 2 });
    expect(encodeAndDecode(Shape, { type: 'rect', w: 1, h: 3 })).toEqual({
      type: 'rect',
      w: 1,
      h: 3,
    });
    expect(Shape.maxSize).toEqual('circle'.length + 8);
  });

  it('throws when the tail does not match the head', () => {
    expect(() => encodeAndDecode(Foo, { length: 2, data: [0.5] })).toThrow();
  });

  it('rejects heads whose output is not assignable to their input', () => {
    type Version = { major: number; minor: number };
    // Written from a string like '2.1', read back as `{ major, minor }`
    const version = bin.u8 as unknown as bin.Schema<string, Version>;

    // When writing, the action would receive `version` as a string, despite reading it as `{ major, minor }`
    // @ts-expect-error
    bin.pipe(version, () => bin.u8);
    // @ts-expect-error
    bin.pipe(bin.struct({ version }), () => bin.u8);

    // A pipe that doesn't carry its head over can't be the head of another pipe
    const Dropping = bin.pipe(bin.struct({ n: bin.u8 }), () => bin.struct({ x: bin.u8 }));
    // @ts-expect-error
    bin.pipe(Dropping, () => bin.u8);
  });

  it('passes the value being written to the action', () => {
    // Accepts numbers and bigints, always reads back a bigint
    const id: bin.Schema<number | bigint, bigint> = {
      write(output, value) {
        bin.u8.write(output, Number(value));
      },
      read(input) {
        return BigInt(bin.u8.read(input));
      },
      measure() {
        return 1;
      },
    };

    const received: unknown[] = [];
    const Packet = bin.pipe(bin.struct({ id }), (head) => {
      if (head === bin.MaxValue) {
        return bin.struct({ flag: bin.bool });
      }
      // Typed as the input of the head, which covers its output as well
      expectTypeOf(head.id).toEqualTypeOf<number | bigint>();
      received.push(head.id);
      return bin.struct({ flag: bin.bool });
    });

    expect(encodeAndDecode(Packet, { id: 5, flag: true })).toEqual({ flag: true });
    // Measured and written from the input (a number), read from the decoded head (a bigint)
    expect(received).toEqual([5, 5, 5n]);
  });
});
