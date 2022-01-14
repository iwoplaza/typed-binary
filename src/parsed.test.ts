// This file doesn't actually need to be run by a test-runner
// It's mostly just to check if structure descriptions can be properly parsed.

import { generic, concreteOf, arrayOf, FLOAT, BOOL, INT, STRING } from './describe';
import { Parsed } from './parsed';


export const KEYFRAME_NODE_TEMPLATE =
    generic('keyframeNode' as const, {
        connections: arrayOf(FLOAT),
    });

export const STANDARD_KEYFRAME_NODE =
    concreteOf(KEYFRAME_NODE_TEMPLATE, 'core:standard' as const, {
        animationKey: STRING,
        startFrame: INT,
        playbackSpeed: FLOAT,
        looping: BOOL,
    });

export const MOVEMENT_KEYFRAME_NODE =
    concreteOf(KEYFRAME_NODE_TEMPLATE, 'core:movement' as const, {
        animationKey: STRING,
        startFrame: INT,
        playbackSpeed: FLOAT,
    });

const subTypeContext = {
    ['keyframeNode' as const]: {
        ['core:standard' as const]: STANDARD_KEYFRAME_NODE,
        ['core:movement' as const]: MOVEMENT_KEYFRAME_NODE,
    },
};

type KEYFRAME_NODE_TEMPLATE = Parsed<typeof KEYFRAME_NODE_TEMPLATE, typeof subTypeContext>;
