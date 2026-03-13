import { expectTypeOf, it } from 'vitest';

import bin from 'typed-binary';

it('parses `i32` properly', () => {
  expectTypeOf<bin.ExtractIn<typeof bin.i32>>().toEqualTypeOf<number>();
  expectTypeOf<bin.ExtractOut<typeof bin.i32>>().toEqualTypeOf<number>();
});

it('parses `string` properly', () => {
  expectTypeOf<bin.ExtractIn<typeof bin.string>>().toEqualTypeOf<string>();
  expectTypeOf<bin.ExtractOut<typeof bin.string>>().toEqualTypeOf<string>();
});

it('parses `optional(string)` properly', () => {
  const Schema = bin.optional(bin.string);
  expectTypeOf<bin.ExtractIn<typeof Schema>>().toEqualTypeOf<string | undefined>();
  expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<string | undefined>();
});

it('parses `dynamicArray(i32)` properly', () => {
  const Schema = bin.dynamicArray(bin.i32);
  expectTypeOf<bin.ExtractIn<typeof Schema>>().toEqualTypeOf<readonly number[]>();
  expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<number[]>();
});

it('parses `dynamicArray(string)` properly', () => {
  const Schema = bin.dynamicArray(bin.string);
  expectTypeOf<bin.ExtractIn<typeof Schema>>().toEqualTypeOf<readonly string[]>();
  expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<string[]>();
});

it('parses `struct({ a: i32, b: string, c: bool })` properly', () => {
  const Schema = bin.struct({
    a: bin.i32,
    b: bin.string,
    c: bin.bool,
  });
  expectTypeOf<bin.ExtractIn<typeof Schema>>().toEqualTypeOf<{
    readonly a: number;
    readonly b: string;
    readonly c: boolean;
  }>();
  expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<{
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
      [ExpressionType.ADD]: {
        leftHandSizeId: bin.i32,
        rightHandSizeId: bin.i32,
      },
      [ExpressionType.NEGATE]: {
        innerExpressionId: bin.i32,
      },
    },
  );

  type Result = bin.ExtractOut<typeof Expression>;

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
      connections: bin.dynamicArray(bin.i32),
    },
    {
      'core:standard': {
        animationKey: bin.string,
        startFrame: bin.i32,
        playbackSpeed: bin.i32,
        looping: bin.bool,
      },
      'core:movement': {
        animationKey: bin.string,
        startFrame: bin.i32,
        playbackSpeed: bin.i32,
      },
    },
  );

  type KeyframeNodeTemplate = bin.ExtractOut<typeof KeyframeNodeTemplate>;
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
  const InfiniteLink = bin.struct({
    value: bin.i32,
    get next() {
      return InfiniteLink;
    },
  });

  expectTypeOf<bin.ExtractOut<typeof InfiniteLink>['next']>().toEqualTypeOf<
    bin.ExtractOut<typeof InfiniteLink>
  >();
});

it('parses tuple schema properly', () => {
  const Schema = bin.tuple([bin.i32, bin.bool]);

  expectTypeOf<bin.ExtractOut<typeof Schema>>().toEqualTypeOf<[number, boolean]>();
});

it('parses complex schema properly', () => {
  const vec3f = bin.tuple([bin.f32, bin.f32, bin.f32]);

  enum NodeType {
    // primitives
    SPHERE = 0,
    BOX3 = 1,
    PLANE = 2,

    // operations
    UNION = 3,
  }

  const Sphere = bin.struct({
    pos: vec3f,
    radius: bin.f32,
  });

  const Box3 = bin.struct({
    pos: vec3f,
    halfSize: vec3f,
  });

  const Plane = bin.struct({
    pos: vec3f,
    normal: vec3f,
  });

  const Union = bin.struct({
    smoothRadius: bin.f32,
  });

  const SceneGraphNode = bin.genericEnum(
    {
      get children() {
        return bin.dynamicArray(SceneGraphNode);
      },
    },
    {
      [NodeType.SPHERE]: Sphere.properties,
      [NodeType.BOX3]: Box3.properties,
      [NodeType.PLANE]: Plane.properties,

      [NodeType.UNION]: Union.properties,
    },
  );

  type Actual = bin.ExtractOut<typeof SceneGraphNode>;

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
