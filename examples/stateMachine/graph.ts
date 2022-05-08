import { INT, arrayOf, object } from 'typed-binary';
import { NodeTemplate } from './node';


export const Graph =
    object({
        entryNode: INT,
        nodes:     arrayOf(NodeTemplate),
    });
