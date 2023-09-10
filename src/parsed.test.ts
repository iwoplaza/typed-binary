// This file doesn't actually need to be run by a test-runner
// It's mostly just to check if structure descriptions can be properly parsed.

import {
  generic,
  arrayOf,
  i32,
  string,
  bool,
  object,
  Parsed,
  genericEnum,
} from '.';

const enum ExpressionType {
  ADD = 0,
  NEGATE = 1,
}

export const Expression = genericEnum({}, () => ({
  [ExpressionType.ADD]: object({
    leftHandSizeId: i32,
    rightHandSizeId: i32,
  }),
  [ExpressionType.NEGATE]: object({
    innerExpressionId: i32,
  }),
}));
type Expression = Parsed<typeof Expression>;
// const expr = {} as Expression;

export const KeyframeNodeTemplate = generic(
  {
    connections: arrayOf(i32),
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
// const s = {} as KeyframeNodeTemplate;
