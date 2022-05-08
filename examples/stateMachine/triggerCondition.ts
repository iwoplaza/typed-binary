import { BYTE, generic, keyed, object } from 'typed-binary';
import type { Parsed } from 'typed-binary';


type TriggerCondition = Parsed<typeof TriggerCondition>;
export const TriggerCondition = keyed('trigger-condition', (TriggerCondition) => generic({}, {
    'core:state': object({
        state: BYTE,
    }),
    'core:animation_finished': object({}),
    'core:not': object({
        condition: TriggerCondition,
    }),
}));


export enum MobState {
    ON_GROUND = 0,
    AIRBORNE = 1,
    STANDING_STILL = 2,
    MOVING_HORIZONTALLY = 3,
}

