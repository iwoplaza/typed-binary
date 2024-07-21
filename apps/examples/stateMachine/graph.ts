import { dynamicArrayOf, i32, object } from 'typed-binary';
import { NodeTemplate } from './node';

export const Graph = object({
  entryNode: i32,
  nodes: dynamicArrayOf(NodeTemplate),
});
