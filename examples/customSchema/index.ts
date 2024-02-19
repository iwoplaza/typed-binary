//
// Run with `npm run example:customSchema`
//

import { Parsed, object } from 'typed-binary';
import { writeAndRead } from '../__util';
import { RADIANS } from './radians';

/*
 * ROTATION
 */

type Rotation = Parsed<typeof Rotation>;
const Rotation = object({
  roll: RADIANS,
  pitch: RADIANS,
  yaw: RADIANS,
});

console.log(
  writeAndRead(Rotation, {
    roll: -0.1,
    pitch: 0.12345,
    yaw: Math.PI + 1.12345,
  }),
);
