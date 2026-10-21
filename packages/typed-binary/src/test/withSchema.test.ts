import { describe, expect, expectTypeOf, it } from 'vitest';
import * as bin from 'typed-binary';
import { encodeAndDecode } from './helpers/mock.ts';

/**
 * An object that is not a schema itself, but defines itself as one.
 */
function component<TSchema extends bin.Schema>(name: string, schema: TSchema) {
  return { name, '~typed-binary': { schema } } as const;
}

const Health = component('health', bin.u16);
const Position = component('position', bin.struct({ x: bin.f32, y: bin.f32 }));

describe('objects defining themselves as schemas', () => {
  it('are accepted by bin.array', () => {
    const Schema = bin.array(Health, 2);

    expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<number[]>();
    expect(Schema.elementSchema).toBe(bin.u16);
    expect(Schema.maxSize).toEqual(4);
    expect(encodeAndDecode(Schema, [1, 2])).toEqual([1, 2]);
  });

  it('are accepted by bin.dynamicArray', () => {
    const Schema = bin.dynamicArray(Health);

    expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<number[]>();
    expect(encodeAndDecode(Schema, [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('are accepted by bin.optional', () => {
    const Schema = bin.optional(Health);

    expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<number | undefined>();
    expect(Schema.inner).toBe(bin.u16);
    expect(encodeAndDecode(Schema, 5)).toEqual(5);
    expect(encodeAndDecode(Schema, undefined)).toEqual(undefined);
  });

  it('are accepted as struct properties', () => {
    const Entity = bin.struct({ id: bin.u32, health: Health, position: Position });
    const value = { id: 1, health: 100, position: { x: 0.5, y: 0.25 } };

    expectTypeOf<bin.ExtractOut<typeof Entity>>().toEqualTypeOf<{
      id: number;
      health: number;
      position: { x: number; y: number };
    }>();
    expect(Entity.maxSize).toEqual(4 + 2 + 8);
    expect(encodeAndDecode(Entity, value)).toEqual(value);
  });

  it('are accepted as recursive struct properties', () => {
    const Node = {
      kind: 'node',
      get '~typed-binary'() {
        return { schema: NodeSchema };
      },
    };
    const NodeSchema = bin.struct({
      value: bin.i32,
      get children() {
        return bin.dynamicArray(Node);
      },
    });
    type Node = bin.ExtractOut<typeof NodeSchema>;

    expectTypeOf<Node>().not.toBeAny();
    expectTypeOf<Node['children'][number]>().toEqualTypeOf<Node>();

    const value: Node = { value: 1, children: [{ value: 2, children: [] }] };
    expect(NodeSchema.maxSize).toBeNaN();
    expect(encodeAndDecode(NodeSchema, value)).toEqual(value);
  });

  it('are accepted by bin.tuple', () => {
    const Schema = bin.tuple([Health, Position]);
    const value: [number, { x: number; y: number }] = [7, { x: 1, y: 2 }];

    expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<
      [number, { x: number; y: number }]
    >();
    expect(Schema.schemas[0]).toBe(bin.u16);
    expect(encodeAndDecode(Schema, value)).toEqual(value);
  });

  it('are accepted by bin.concat', () => {
    const Schema = bin.concat([Position, bin.struct({ z: bin.f32 })]);
    const value = { x: 1, y: 2, z: 3 };

    expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<{
      x: number;
      y: number;
      z: number;
    }>();
    expect(encodeAndDecode(Schema, value)).toEqual(value);
  });

  it('are accepted as the tag, variants, variant properties and base properties of bin.union', () => {
    const Kind = component('kind', bin.orderedEnum('point', 'damage'));
    const Schema = bin.union(
      Kind,
      { point: Position, damage: { amount: Health } },
      { base: { health: Health } },
    );
    type Schema = bin.ExtractOut<typeof Schema>;

    expectTypeOf<Schema>().toEqualTypeOf<
      | { type: 'point'; health: number; x: number; y: number }
      | { type: 'damage'; health: number; amount: number }
    >();

    const point: Schema = { type: 'point', health: 3, x: 1, y: 2 };
    const damage: Schema = { type: 'damage', health: 3, amount: 10 };
    expect(encodeAndDecode(Schema, point)).toEqual(point);
    expect(encodeAndDecode(Schema, damage)).toEqual(damage);
    expect(Schema.maxSize).toEqual(1 + 2 + 8);
  });

  it('are accepted as the head of bin.pipe, and returned from its action', () => {
    const Schema = bin.pipe(Health, (health) =>
      health !== bin.MaxValue && health === 0 ? component('dead', bin.inherent(0)) : Health,
    );

    expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<number>();
    expect(encodeAndDecode(Schema, 0)).toEqual(0);
    expect(encodeAndDecode(Schema, 50)).toEqual(50);
  });

  it('can be classes', () => {
    class Vec2 {
      static readonly '~typed-binary' = { schema: bin.struct({ x: bin.f32, y: bin.f32 }) };
    }
    const Schema = bin.struct({ position: Vec2 });
    const value = { position: { x: 1, y: 2 } };

    expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<{
      position: { x: number; y: number };
    }>();
    expect(encodeAndDecode(Schema, value)).toEqual(value);
  });
});

describe('invalid schemas', () => {
  it('are reported by bin.struct on first use, so getters stay lazy', () => {
    const Schema = bin.struct({ a: { '~typed-binary': { schema: 5 } } as any });

    expect(() => Schema.maxSize).toThrow(bin.InvalidSchemaShapeError);
  });

  it('are reported by bin.tuple', () => {
    expect(() => bin.tuple([bin.u8, 5] as any)).toThrow(bin.InvalidSchemaShapeError);
  });

  it('are reported by bin.concat', () => {
    expect(() => bin.concat([bin.u8] as any)).toThrow(bin.InvalidSchemaShapeError);
  });
});

describe('maxSize', () => {
  it('is declared on arrays, dynamic arrays and optionals', () => {
    expectTypeOf(bin.array(bin.u32, 2).maxSize).toEqualTypeOf<number>();
    expectTypeOf(bin.dynamicArray(bin.u32).maxSize).toEqualTypeOf<number>();
    expectTypeOf(bin.optional(bin.u32).maxSize).toEqualTypeOf<number>();
  });
});
