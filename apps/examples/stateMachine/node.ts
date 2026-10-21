import * as bin from 'typed-binary';
import { ConnectionTemplate } from './connection';

export const NodeTemplate = bin.struct({
  animationKey: bin.string,
  startFrame: bin.i32,
  playbackSpeed: bin.f32,
  looping: bin.bool,
  connections: bin.dynamicArray(ConnectionTemplate),
});
