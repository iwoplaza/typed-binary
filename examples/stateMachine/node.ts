import { bool, dynamicArrayOf, f32, i32, object, string } from 'typed-binary';
import { ConnectionTemplate } from './connection';

export const NodeTemplate = object({
  animationKey: string,
  startFrame: i32,
  playbackSpeed: f32,
  looping: bool,
  connections: dynamicArrayOf(ConnectionTemplate),
});
