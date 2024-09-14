//
// Run with `npm run example:customSchema`
//

import bin from 'typed-binary';
import { writeAndRead } from '../__util';
import { radians } from './radians';

/*
 * ROTATION
 */

type Rotation = bin.Parsed<typeof Rotation>;
const Rotation = bin.object({
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
