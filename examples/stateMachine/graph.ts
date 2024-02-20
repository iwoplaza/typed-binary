import { i32, dynamicArrayOf, object } from 'typed-binary';
import { NodeTemplate } from './node';

export const Graph = object({
  entryNode: i32,
  nodes: dynamicArrayOf(NodeTemplate),
});
