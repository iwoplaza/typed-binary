//
// Run with `npm run example:recursiveTypes`
//

import * as bin from 'typed-binary';

// Recursive tagged union: variants referencing the union through getters

type Expression = bin.ExtractOut<typeof Expression>;
const Expression = bin.union(bin.orderedEnum('int_literal', 'negate', 'multiply'), {
  int_literal: { value: bin.i32 },
  negate: {
    get inner() {
      return Expression;
    },
  },
  multiply: {
    get a() {
      return Expression;
    },
    get b() {
      return Expression;
    },
  },
});

const expr: Expression = {
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

// Recursive structs

type Instruction = bin.ExtractOut<typeof Instruction>;
const Instruction = bin.struct({
  target_variable: bin.string,
  expression: bin.optional(Expression),
});

const Cycle = bin.struct({
  value: bin.string,
  get next() {
    return bin.optional(Cycle);
  },
});

type Complex = bin.ExtractOut<typeof Complex>;
const Complex = bin.struct({
  label: bin.string,
  get inner() {
    return bin.optional(Complex);
  },
  cycle: Cycle,
});

const inst: Instruction = {
  target_variable: 'firstlevel',
  expression: expr,
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

// Round-tripping through binary

function roundTrip<T extends bin.Schema>(schema: T, value: bin.ExtractIn<T>): bin.ExtractOut<T> {
  const buffer = new ArrayBuffer(schema.measure(value).size);
  schema.write(new bin.BufferWriter(buffer), value);
  return schema.read(new bin.BufferReader(buffer));
}

console.log(JSON.stringify(roundTrip(Instruction, inst), null, 2));
console.log(JSON.stringify(roundTrip(Complex, complex), null, 2));
console.log('Max size of a recursive schema:', Expression.maxSize);
