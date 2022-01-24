import { Parsed } from 'typed-binary';
import { object, arrayOf, tupleOf, INT } from 'typed-binary';

export const Vertex = object({
    x: INT,
    y: INT,
    z: INT,
});

export const Polygon = object({
    vertices: tupleOf(Vertex, 3),
});

export const Mesh = object({
    faces: arrayOf(Polygon),
});

// Helpful for the top-most level element
export type Mesh = Parsed<typeof Mesh>;
