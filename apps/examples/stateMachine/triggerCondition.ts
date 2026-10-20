import * as bin from 'typed-binary';

export const TriggerCondition = bin.union(bin.string, {
  'core:state': {
    state: bin.u8,
  },
  'core:animation_finished': {},
  'core:not': {
    get condition() {
      return TriggerCondition;
    },
  },
});

export enum MobState {
  ON_GROUND = 0,
  AIRBORNE = 1,
  STANDING_STILL = 2,
  MOVING_HORIZONTALLY = 3,
}
