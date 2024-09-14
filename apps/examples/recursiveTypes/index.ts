//
// Run with `npm run example:recursiveTypes`
//

import bin from 'typed-binary';

type Expression = bin.Parsed<typeof Expression>;
const Expression = bin.keyed('expression', (Expression) =>
  bin.generic(
    {},
    {
      multiply: bin.object({
        a: Expression,
        b: Expression,
      }),
      negate: bin.object({
        inner: Expression,
      }),
      int_literal: bin.object({
        value: bin.i32,
      }),
    },
  ),
);

const expr: bin.Parsed<typeof Expression> = {
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

type Instruction = bin.Parsed<typeof Instruction>;
const Instruction = bin.object({
  target_variable: bin.string,
  expression: bin.optional(Expression),
});

type Complex = bin.Parsed<typeof Complex>;
const Complex = bin.keyed('complex' as const, (Complex) =>
  bin.object({
    label: bin.string,
    inner: bin.optional(Complex),
    cycle: bin.keyed('cycle' as const, (Cycle) =>
      bin.object({
        value: bin.string,
        next: bin.optional(Cycle),
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
