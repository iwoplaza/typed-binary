//
// Run with `npm run example:recursiveTypes`
//

import { INT, object, Parsed, ParsedConcrete, STRING, typedGeneric, typedObject, TypeToken } from 'typed-binary';

interface ExpressionBase {}

interface MultiplyExpression extends ExpressionBase {
    type: 'multiply';
    a: Expression;
    b: Expression;
}

interface NegateExpression extends ExpressionBase {
    type: 'negate';
    inner: Expression;
}

type IntLiteralExpression = ParsedConcrete<ExpressionBase, typeof IntLiteralExpression, 'int_literal'>;
const IntLiteralExpression = object({
    value: INT,
});

type Expression = MultiplyExpression|NegateExpression|IntLiteralExpression;
const Expression = typedGeneric(new TypeToken<Expression>(), {
    name: STRING,
}, {
    'multiply': typedObject<MultiplyExpression>(() => ({
        a: Expression,
        b: Expression,
    })),
    'negate': typedObject<NegateExpression>(() => ({
        inner: Expression,
    })),
    'int_literal': IntLiteralExpression
});

const expr: Parsed<typeof Expression> = {
    type: 'multiply',
    a: {
        type: 'negate',
        inner: {
            type: 'int_literal',
            value: 15,
        }
    },
    b: {
        type: 'int_literal',
        value: 2,
    },
};

