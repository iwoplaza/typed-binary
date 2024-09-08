//
// Run with `npm run example:recursiveTypes`
//

import type { Parsed } from 'typed-binary';
import { generic, i32, keyed, object, optional, string } from 'typed-binary';

type Expression = Parsed<typeof Expression>;
const Expression = keyed('expression', (Expression) =>
  generic(
    {},
    {
      multiply: object({
        a: Expression,
        b: Expression,
      }),
      negate: object({
        inner: Expression,
      }),
      int_literal: object({
        value: i32,
      }),
    },
  ),
);

const expr: Parsed<typeof Expression> = {
  type: 'multiply',
  a: {
    type: 'negate',
    inner: {
      type: 'int_literal',
      value: 15,
    },
  },
  b: {
    type: 'int_literal',
    value: 2,
  },
};

type Instruction = Parsed<typeof Instruction>;
const Instruction = object({
  target_variable: string,
  expression: optional(Expression),
});

type Complex = Parsed<typeof Complex>;
const Complex = keyed('complex' as const, (Complex) =>
  object({
    label: string,
    inner: optional(Complex),
    cycle: keyed('cycle' as const, (Cycle) =>
      object({
        value: string,
        next: optional(Cycle),
      }),
    ),
  }),
);

const inst: Instruction = {
  target_variable: 'firstlevel',
  expression: undefined,
};

const complex: Complex = {
  label: '1',
  inner: {
    label: '1->2',
    inner: undefined,
    cycle: {
      value: '1->2: A',
      next: undefined,
    },
  },
  cycle: {
    value: '1: B',
    next: {
      value: '1: B->C',
      next: undefined,
    },
  },
};

console.log(expr);
console.log(inst);
console.log(complex);
