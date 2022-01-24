import { STRING, typedGeneric, typedObject, TypeToken } from 'typed-binary';

interface Expression {
    name: string;
    inner: Expression;
}

interface MultiplyExpression {
    a: Expression;
    b: Expression;
}

interface NegateExpression {
    inner: Expression;
}

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
});

const expr = Expression.read({} as any);
