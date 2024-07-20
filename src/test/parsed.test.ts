import { expectTypeOf, it } from 'vitest';

import {
  type Parsed,
  bool,
  dynamicArrayOf,
  f32,
  generic,
  genericEnum,
  i32,
  keyed,
  object,
  optional,
  string,
  tupleOf,
} from '..';

it('parses `i32` properly', () => {
  expectTypeOf<Parsed<typeof i32>>().toEqualTypeOf<number>();
});

it('parses `string` properly', () => {
  expectTypeOf<Parsed<typeof string>>().toEqualTypeOf<string>();
});

it('parses `optional(string)` properly', () => {
  const Schema = optional(string);
  expectTypeOf<Parsed<typeof Schema>>().toEqualTypeOf<string | undefined>();
});

it('parses `dynamicArrayOf(i32)` properly', () => {
  const Schema = dynamicArrayOf(i32);
  expectTypeOf<Parsed<typeof Schema>>().toEqualTypeOf<number[]>();
});

it('parses `dynamicArrayOf(string)` properly', () => {
  const Schema = dynamicArrayOf(string);
  expectTypeOf<Parsed<typeof Schema>>().toEqualTypeOf<string[]>();
});

it('parses `object({ a: i32, b: string, c: bool })` properly', () => {
  const Schema = object({
    a: i32,
    b: string,
    c: bool,
  });
  expectTypeOf<Parsed<typeof Schema>>().toEqualTypeOf<{
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

  const Expression = genericEnum(
    {},
    {
      [ExpressionType.ADD]: object({
        leftHandSizeId: i32,
        rightHandSizeId: i32,
      }),
      [ExpressionType.NEGATE]: object({
        innerExpressionId: i32,
      }),
    },
  );

  type Result = Parsed<typeof Expression>;

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
  const KeyframeNodeTemplate = generic(
    {
      connections: dynamicArrayOf(i32),
    },
    {
      'core:standard': object({
        animationKey: string,
        startFrame: i32,
        playbackSpeed: i32,
        looping: bool,
      }),
      'core:movement': object({
        animationKey: string,
        startFrame: i32,
        playbackSpeed: i32,
      }),
    },
  );

  type KeyframeNodeTemplate = Parsed<typeof KeyframeNodeTemplate>;
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
  const InfiniteLink = keyed('infinite-link', (InfiniteLink) =>
    object({
      value: i32,
      next: InfiniteLink,
    }),
  );

  expectTypeOf<Parsed<typeof InfiniteLink>['next']>().toEqualTypeOf<
    Parsed<typeof InfiniteLink>
  >();
});

it('parses tuple schema properly', () => {
  const Schema = tupleOf([i32, bool]);

  expectTypeOf<Parsed<typeof Schema>>().toEqualTypeOf<[number, boolean]>();
});

it('parses complex schema properly', () => {
  const vec3f = tupleOf([f32, f32, f32]);

  enum NodeType {
    // primitives
    SPHERE = 0,
    BOX3 = 1,
    PLANE = 2,

    // operations
    UNION = 3,
  }

  const Sphere = object({
    pos: vec3f,
    radius: f32,
  });

  const Box3 = object({
    pos: vec3f,
    halfSize: vec3f,
  });

  const Plane = object({
    pos: vec3f,
    normal: vec3f,
  });

  const Union = object({
    smoothRadius: f32,
  });

  const SceneGraphNode = keyed('node', (SceneGraphNode) =>
    genericEnum(
      {
        children: dynamicArrayOf(SceneGraphNode),
      },
      {
        [NodeType.SPHERE]: Sphere,
        [NodeType.BOX3]: Box3,
        [NodeType.PLANE]: Plane,

        [NodeType.UNION]: Union,
      },
    ),
  );

  type Actual = Parsed<typeof SceneGraphNode>;

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
