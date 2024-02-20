import { bool, f32, i32, string, dynamicArrayOf, object } from 'typed-binary';
import { ConnectionTemplate } from './connection';

export const NodeTemplate = object({
  animationKey: string,
  startFrame: i32,
  playbackSpeed: f32,
  looping: bool,
  connections: dynamicArrayOf(ConnectionTemplate),
});
