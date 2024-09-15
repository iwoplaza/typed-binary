import bin from 'typed-binary';
import { NodeTemplate } from './node';

export const Graph = bin.object({
  entryNode: bin.i32,
  nodes: bin.dynamicArrayOf(NodeTemplate),
});
