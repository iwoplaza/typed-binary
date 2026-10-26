import { describe, expect, expectTypeOf, it } from 'vitest';
import * as bin from 'typed-binary';
import { encodeAndDecode, makeIO } from './helpers/mock.ts';

describe('bin.union', () => {
  const Shape = bin.union(bin.orderedEnum('circle', 'rect'), {
    circle: { radius: bin.f32 },
    rect: { width: bin.f32, height: bin.f32 },
  });

  it('infers a tagged union', () => {
    expectTypeOf<bin.ExtractOut<typeof Shape>>().toEqualTypeOf<
      { type: 'circle'; radius: number } | { type: 'rect'; width: number; height: number }
    >();
    expectTypeOf<bin.ExtractIn<typeof Shape>>().toEqualTypeOf<
      | { readonly type: 'circle'; readonly radius: number }
      | { readonly type: 'rect'; readonly width: number; readonly height: number }
    >();
  });

  it('encodes the tag, followed by the variant', () => {
    expect(encodeAndDecode(Shape, { type: 'circle', radius: 2 })).toEqual({
      type: 'circle',
      radius: 2,
    });
    expect(encodeAndDecode(Shape, { type: 'rect', width: 1, height: 3 })).toEqual({
      type: 'rect',
      width: 1,
      height: 3,
    });

    const { output, input } = makeIO(9);
    Shape.write(output, { type: 'rect', width: 1, height: 3 });
    expect(bin.u8.read(input)).toEqual(1);
    expect(bin.f32.read(input)).toEqual(1);
    expect(bin.f32.read(input)).toEqual(3);
  });

  it('measures values and the exact max size', () => {
    expect(Shape.measure({ type: 'circle', radius: 2 })).toEqual(1 + 4);
    expect(Shape.maxSize).toEqual(1 + 8);
  });

  it('accounts for tags of varying size when measuring the max size', () => {
    const Tagged = bin.union(bin.prefixEnum('long-tag', 'x'), {
      'long-tag': { a: bin.u8 },
      x: { a: bin.u32 },
    });
    // 'long-tag' + u8 (9) is bigger than 'x' + u32 (5)
    expect(Tagged.maxSize).toEqual(9);
  });

  it('supports a custom key', () => {
    const Event = bin.union(
      bin.orderedEnum('click', 'scroll'),
      { click: { x: bin.i16, y: bin.i16 }, scroll: { delta: bin.f32 } },
      { key: 'kind' },
    );
    expectTypeOf<bin.ExtractOut<typeof Event>>().toEqualTypeOf<
      { kind: 'click'; x: number; y: number } | { kind: 'scroll'; delta: number }
    >();
    expect(encodeAndDecode(Event, { kind: 'scroll', delta: 0.5 })).toEqual({
      kind: 'scroll',
      delta: 0.5,
    });
  });

  it('supports base properties shared by all variants', () => {
    const Node = bin.union(
      bin.orderedEnum('leaf', 'branch'),
      { leaf: { value: bin.i32 }, branch: { weight: bin.f32 } },
      { base: { id: bin.u16 } },
    );
    expectTypeOf<bin.ExtractOut<typeof Node>>().toEqualTypeOf<
      { type: 'leaf'; id: number; value: number } | { type: 'branch'; id: number; weight: number }
    >();
    expect(encodeAndDecode(Node, { type: 'leaf', id: 7, value: -3 })).toEqual({
      type: 'leaf',
      id: 7,
      value: -3,
    });
    expect(Node.maxSize).toEqual(1 + 2 + 4);
  });

  it('accepts structs as variants', () => {
    const Circle = bin.struct({ radius: bin.f32 });
    const WithStruct = bin.union(bin.orderedEnum('circle'), { circle: Circle });
    expectTypeOf<bin.ExtractOut<typeof WithStruct>>().toEqualTypeOf<{
      type: 'circle';
      radius: number;
    }>();
    expect(encodeAndDecode(WithStruct, { type: 'circle', radius: 1 })).toEqual({
      type: 'circle',
      radius: 1,
    });
  });

  it('requires a variant for every tag value', () => {
    // @ts-expect-error: missing 'rect'
    bin.union(bin.orderedEnum('circle', 'rect'), { circle: { radius: bin.f32 } });
  });

  it('throws on unknown variants', () => {
    // @ts-expect-error
    expect(() => Shape.measure({ type: 'triangle' })).toThrow(/Unknown variant/);

    const { output, input } = makeIO(1);
    bin.u8.write(output, 5);
    expect(() => Shape.read(input)).toThrow();
  });
});

describe('bin.union recursion', () => {
  it('supports getters in variants', () => {
    const Expr = bin.union(bin.orderedEnum('lit', 'neg', 'mul'), {
      lit: { value: bin.i32 },
      neg: {
        get inner() {
          return Expr;
        },
      },
      mul: {
        get a() {
          return Expr;
        },
        get b() {
          return Expr;
        },
      },
    });
    type Expr = bin.ExtractOut<typeof Expr>;

    expectTypeOf<Expr>().not.toBeAny();
    expectTypeOf<Extract<Expr, { type: 'mul' }>['a']>().toEqualTypeOf<Expr>();

    const value: Expr = {
      type: 'mul',
      a: { type: 'neg', inner: { type: 'lit', value: 15 } },
      b: { type: 'lit', value: 2 },
    };
    expect(Expr.measure(value)).toEqual(1 + (1 + (1 + 4)) + (1 + 4));
    expect(encodeAndDecode(Expr, value)).toEqual(value);
    expect(Expr.maxSize).toBeNaN();
  });

  it('supports getters in base properties', () => {
    const Tree = bin.union(
      bin.orderedEnum('sphere', 'box'),
      { sphere: { radius: bin.f32 }, box: { size: bin.f32 } },
      {
        base: {
          get children() {
            return bin.dynamicArray(Tree);
          },
        },
      },
    );
    type Tree = bin.ExtractOut<typeof Tree>;
    expectTypeOf<Tree['children']>().toEqualTypeOf<Tree[]>();

    const value: Tree = {
      type: 'box',
      children: [{ type: 'sphere', children: [], radius: 1 }],
      size: 2,
    };
    expect(encodeAndDecode(Tree, value)).toEqual(value);
  });
});

// `bin.generic` and `bin.genericEnum` were replaced by `bin.union`. These tests pin down that
// data encoded by them can still be read, with `bin.u8` and `bin.string` tags respectively.
describe('bin.union compatibility with v4 generic objects', () => {
  it('encodes like v4 bin.genericEnum when the tag is bin.u8', () => {
    const Union = bin.union(
      bin.u8,
      {
        0: { leftId: bin.i32, rightId: bin.i32 },
        1: { innerId: bin.i32 },
      },
      { base: { connections: bin.dynamicArray(bin.i32) } },
    );

    const value = { type: 0 as const, connections: [1, 2], leftId: 3, rightId: 4 };
    const { output, input } = makeIO(Union.measure(value));
    Union.write(output, value);

    // Tag, then base properties, then sub-type properties
    expect(bin.u8.read(input)).toEqual(0);
    expect(bin.u32.read(input)).toEqual(2);
    expect(bin.i32.read(input)).toEqual(1);
    expect(bin.i32.read(input)).toEqual(2);
    expect(bin.i32.read(input)).toEqual(3);
    expect(bin.i32.read(input)).toEqual(4);
    expect(input.offset).toEqual(Union.measure(value));
  });

  it('encodes like v4 bin.generic when the tag is bin.string', () => {
    const Union = bin.union(
      bin.string,
      {
        'core:standard': { looping: bin.bool },
        'core:movement': { speed: bin.f32 },
      },
      { base: { sharedValue: bin.i32 } },
    );

    const value = { type: 'core:movement' as const, sharedValue: 100, speed: 0.5 };
    const { output, input } = makeIO(Union.measure(value));
    Union.write(output, value);

    // Tag, then base properties, then sub-type properties
    expect(bin.string.read(input)).toEqual('core:movement');
    expect(bin.i32.read(input)).toEqual(100);
    expect(bin.f32.read(input)).toEqual(0.5);
    expect(input.offset).toEqual(Union.measure(value));

    // The tag can only be one of the known variants, so the max size is bounded,
    // unlike with v4 bin.generic. Both tags are equally long, 'core:movement' has
    // the bigger variant (f32).
    expect(Union.maxSize).toEqual('core:movement'.length + 1 + 4 + 4);
  });
});

it('supports numeric enum keys, reused properties and a recursive base', () => {
  enum NodeType {
    SPHERE = 0,
    BOX3 = 1,
  }

  const vec3f = bin.tuple([bin.f32, bin.f32, bin.f32]);
  const Sphere = bin.struct({ pos: vec3f, radius: bin.f32 });
  const Box3 = bin.struct({ pos: vec3f, halfSize: vec3f });

  const SceneGraphNode = bin.union(
    bin.u8,
    {
      [NodeType.SPHERE]: Sphere.properties,
      [NodeType.BOX3]: Box3,
    },
    {
      base: {
        get children() {
          return bin.dynamicArray(SceneGraphNode);
        },
      },
    },
  );
  type SceneGraphNode = bin.ExtractOut<typeof SceneGraphNode>;

  expectTypeOf<SceneGraphNode>().toMatchTypeOf<
    | { type: NodeType.SPHERE; children: SceneGraphNode[]; pos: number[]; radius: number }
    | { type: NodeType.BOX3; children: SceneGraphNode[]; pos: number[]; halfSize: number[] }
  >();

  const value: SceneGraphNode = {
    type: NodeType.BOX3,
    children: [{ type: NodeType.SPHERE, children: [], pos: [1, 2, 3], radius: 4 }],
    pos: [0, 0, 0],
    halfSize: [1, 1, 1],
  };
  expect(encodeAndDecode(SceneGraphNode, value)).toEqual(value);
  expect(SceneGraphNode.maxSize).toBeNaN();
});
