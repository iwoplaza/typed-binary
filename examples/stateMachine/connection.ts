import { BYTE, FLOAT, INT, object } from 'typed-binary';
import { TriggerCondition } from './triggerCondition';


export const ConnectionTemplate =
    object({
        targetNodeIndex: INT,
        /**
         * The duration of the transition in Minecraft ticks
         */
        transitionDuration: FLOAT,
        transitionEasing: BYTE,
        triggerCondition: TriggerCondition,
    });

export enum Easing {
    LINEAR = 0,
    EASE_IN_QUAD = 1,
    EASE_OUT_QUAD = 2,
    EASE_IN_OUT_QUAD = 3,
    EASE_IN_CUBIC = 4,
    EASE_OUT_CUBIC = 5,
    EASE_IN_OUT_SINE = 6,
}