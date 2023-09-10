import { i32, arrayOf, object } from 'typed-binary';
import { NodeTemplate } from './node';

export const Graph = object({
  entryNode: i32,
  nodes: arrayOf(NodeTemplate),
});
