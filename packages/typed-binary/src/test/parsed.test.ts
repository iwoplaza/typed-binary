import { expectTypeOf, it } from 'vitest';

// Importing from the public API
import bin from '../index.ts';

it('parses `i32` properly', () => {
  expectTypeOf<bin.Parsed<typeof bin.i32>>().toEqualTypeOf<number>();
});

it('parses `string` properly', () => {
  expectTypeOf<bin.Parsed<typeof bin.string>>().toEqualTypeOf<string>();
});

it('parses `optional(string)` properly', () => {
  const Schema = bin.optional(bin.string);
  expectTypeOf<bin.Parsed<typeof Schema>>().toEqualTypeOf<string | undefined>();
});

it('parses `dynamicArrayOf(i32)` properly', () => {
  const Schema = bin.dynamicArrayOf(bin.i32);
  expectTypeOf<bin.Parsed<typeof Schema>>().toEqualTypeOf<number[]>();
});

it('parses `dynamicArrayOf(string)` properly', () => {
  const Schema = bin.dynamicArrayOf(bin.string);
  expectTypeOf<bin.Parsed<typeof Schema>>().toEqualTypeOf<string[]>();
});

it('parses `object({ a: i32, b: string, c: bool })` properly', () => {
  const Schema = bin.object({
    a: bin.i32,
    b: bin.string,
    c: bin.bool,
  });
  expectTypeOf<bin.Parsed<typeof Schema>>().toEqualTypeOf<{
    a: number;
    b: string;
    c: boolean;
  }>();
});

it('parses `genericEnum` properly', () => {
  enum ExpressionType {
    ADD = 0,
    NEGATE = 1,
  }

  const Expression = bin.genericEnum(
    {},
    {
      [ExpressionType.ADD]: bin.object({
        leftHandSizeId: bin.i32,
        rightHandSizeId: bin.i32,
      }),
      [ExpressionType.NEGATE]: bin.object({
        innerExpressionId: bin.i32,
      }),
    },
  );

  type Result = bin.Parsed<typeof Expression>;

  expectTypeOf<Result>().toEqualTypeOf<
    | {
        type: ExpressionType.ADD;
        leftHandSizeId: number;
        rightHandSizeId: number;
      }
    | {
        type: ExpressionType.NEGATE;
        innerExpressionId: number;
      }
  >();
});

it('parses `generic` with base properties properly', () => {
  const KeyframeNodeTemplate = bin.generic(
    {
      connections: bin.dynamicArrayOf(bin.i32),
    },
    {
      'core:standard': bin.object({
        animationKey: bin.string,
        startFrame: bin.i32,
        playbackSpeed: bin.i32,
        looping: bin.bool,
      }),
      'core:movement': bin.object({
        animationKey: bin.string,
        startFrame: bin.i32,
        playbackSpeed: bin.i32,
      }),
    },
  );

  type KeyframeNodeTemplate = bin.Parsed<typeof KeyframeNodeTemplate>;
  expectTypeOf<KeyframeNodeTemplate>().toEqualTypeOf<
    | {
        type: 'core:standard';
        connections: number[];
        animationKey: string;
        startFrame: number;
        playbackSpeed: number;
        looping: boolean;
      }
    | {
        type: 'core:movement';
        connections: number[];
        animationKey: string;
        startFrame: number;
        playbackSpeed: number;
      }
  >();
});

it('parses simple recursive record properly', () => {
  const InfiniteLink = bin.keyed('infinite-link', (InfiniteLink) =>
    bin.object({
      value: bin.i32,
      next: InfiniteLink,
    }),
  );

  expectTypeOf<bin.Parsed<typeof InfiniteLink>['next']>().toEqualTypeOf<
    bin.Parsed<typeof InfiniteLink>
  >();
});

it('parses tuple schema properly', () => {
  const Schema = bin.tupleOf([bin.i32, bin.bool]);

  expectTypeOf<bin.Parsed<typeof Schema>>().toEqualTypeOf<[number, boolean]>();
});

it('parses complex schema properly', () => {
  const vec3f = bin.tupleOf([bin.f32, bin.f32, bin.f32]);

  enum NodeType {
    // primitives
    SPHERE = 0,
    BOX3 = 1,
    PLANE = 2,

    // operations
    UNION = 3,
  }

  const Sphere = bin.object({
    pos: vec3f,
    radius: bin.f32,
  });

  const Box3 = bin.object({
    pos: vec3f,
    halfSize: vec3f,
  });

  const Plane = bin.object({
    pos: vec3f,
    normal: vec3f,
  });

  const Union = bin.object({
    smoothRadius: bin.f32,
  });

  const SceneGraphNode = bin.keyed('node', (SceneGraphNode) =>
    bin.genericEnum(
      {
        children: bin.dynamicArrayOf(SceneGraphNode),
      },
      {
        [NodeType.SPHERE]: Sphere,
        [NodeType.BOX3]: Box3,
        [NodeType.PLANE]: Plane,

        [NodeType.UNION]: Union,
      },
    ),
  );

  type Actual = bin.Parsed<typeof SceneGraphNode>;

  type Expected = {
    children: Expected[];
  } & (
    | { type: NodeType.SPHERE; pos: [number, number, number]; radius: number }
    | {
        type: NodeType.BOX3;
        pos: [number, number, number];
        halfSize: [number, number, number];
      }
    | {
        type: NodeType.PLANE;
        pos: [number, number, number];
        normal: [number, number, number];
      }
    | {
        type: NodeType.UNION;
        smoothRadius: number;
      }
  );

  expectTypeOf<Actual>().toMatchTypeOf<Expected>();
});
