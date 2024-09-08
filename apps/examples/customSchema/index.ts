//
// Run with `npm run example:customSchema`
//

import { type Parsed, object } from 'typed-binary';
import { writeAndRead } from '../__util';
import { radians } from './radians';

/*
 * ROTATION
 */

type Rotation = Parsed<typeof Rotation>;
const Rotation = object({
  roll: radians,
  pitch: radians,
  yaw: radians,
});

console.log(
  writeAndRead(Rotation, {
    roll: -0.1,
    pitch: 0.12345,
    yaw: Math.PI + 1.12345,
  }),
);
