import * as bin from 'typed-binary';
import { NodeTemplate } from './node';

export const Graph = bin.struct({
  entryNode: bin.i32,
  nodes: bin.dynamicArray(NodeTemplate),
});
