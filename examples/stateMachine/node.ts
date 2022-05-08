import { BOOL, FLOAT, INT, STRING, arrayOf, object } from 'typed-binary';
import { ConnectionTemplate } from './connection';


export const NodeTemplate =
    object({
        animationKey:   STRING,
        startFrame:     INT,
        playbackSpeed:  FLOAT,
        looping:        BOOL,
        connections: arrayOf(ConnectionTemplate),
    });
