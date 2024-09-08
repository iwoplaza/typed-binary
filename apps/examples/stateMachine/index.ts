//
// Run with `npm run example:stateMachine`
//

import type { Parsed } from 'typed-binary';
import { Easing } from './connection';
import type { Graph } from './graph';
import { MobState } from './triggerCondition';

const graph: Parsed<typeof Graph> = {
  entryNode: 0,
  nodes: [
    {
      animationKey: '',
      looping: false,
      playbackSpeed: 1,
      startFrame: 0,
      connections: [
        {
          targetNodeIndex: 1,
          transitionDuration: 3,
          transitionEasing: Easing.EASE_IN_OUT_QUAD,
          triggerCondition: {
            type: 'core:state',
            state: MobState.MOVING_HORIZONTALLY,
          },
        },
      ],
    },
  ],
};

console.log(graph);
