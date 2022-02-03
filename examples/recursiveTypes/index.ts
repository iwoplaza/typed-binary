//
// Run with `npm run example:recursiveTypes`
//

import type { Parsed } from 'typed-binary';
import { STRING, keyed, object, optional } from 'typed-binary';

type Expression = Parsed<typeof Expression>;
const Expression = keyed('expression' as const, (Expression) => object({
    bruh: STRING,
    inner: optional(Expression),
}));

type Instruction = Parsed<typeof Instruction>;
const Instruction = object({
    some: STRING,
    inner: optional(Expression),
});

type Complex = Parsed<typeof Complex>;
const Complex = keyed('complex' as const, (Complex) => object({
    label: STRING,
    inner: optional(Complex),
    cycle: keyed('cycle' as const, (Cycle) => object({
        value: STRING,
        next: optional(Cycle),
    })),
}));

const expr: Expression = {
    bruh: 'firstLevel',
    inner: {
        bruh: 'hello',
        inner: undefined,
    },
};

const inst: Instruction = {
    some: 'firstlevel',
    inner: undefined,
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
}

console.log(expr);
console.log(inst);
console.log(complex);