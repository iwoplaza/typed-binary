import bin from 'typed-binary';
import { TriggerCondition } from './triggerCondition';

export const ConnectionTemplate = bin.object({
  targetNodeIndex: bin.i32,
  /**
   * The duration of the transition in Minecraft ticks
   */
  transitionDuration: bin.f32,
  transitionEasing: bin.byte,
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
