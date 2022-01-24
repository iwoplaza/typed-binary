// This file doesn't actually need to be run by a test-runner
// It's mostly just to check if structure descriptions can be properly parsed.

import { generic, arrayOf, INT, STRING, BOOL, object, Parsed, genericEnum } from '.';

const enum ExpressionType {
    ADD = 0,
    NEGATE = 1,
};

export const Expression = 
    genericEnum({}, () => ({
        [ExpressionType.ADD]: object({
            leftHandSizeId: INT,
            rightHandSizeId: INT,
        }),
        [ExpressionType.NEGATE]: object({
            innerExpressionId: INT,
        }),
    }));
type Expression = Parsed<typeof Expression>;
const expr = {} as Expression;


export const KeyframeNodeTemplate =
    generic({
        connections: arrayOf(INT),
    }, {
        'core:standard': object({
            animationKey: STRING,
            startFrame: INT,
            playbackSpeed: INT,
            looping: BOOL,
        }),
        'core:movement': object({
            animationKey: STRING,
            startFrame: INT,
            playbackSpeed: INT,
        }),
    });

type KeyframeNodeTemplate = Parsed<typeof KeyframeNodeTemplate>;
const s = {} as KeyframeNodeTemplate;
