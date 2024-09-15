import bin from 'typed-binary';

type TriggerCondition = bin.Parsed<typeof TriggerCondition>;
export const TriggerCondition = bin.keyed(
  'trigger-condition',
  (TriggerCondition) =>
    bin.generic(
      {},
      {
        'core:state': bin.object({
          state: bin.byte,
        }),
        'core:animation_finished': bin.object({}),
        'core:not': bin.object({
          condition: TriggerCondition,
        }),
      },
    ),
);

export enum MobState {
  ON_GROUND = 0,
  AIRBORNE = 1,
  STANDING_STILL = 2,
  MOVING_HORIZONTALLY = 3,
}
