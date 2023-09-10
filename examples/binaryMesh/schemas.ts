import { Parsed } from 'typed-binary';
import { object, arrayOf, tupleOf, i32 } from 'typed-binary';

export const Vertex = object({
  x: i32,
  y: i32,
  z: i32,
});

export const Polygon = object({
  vertices: tupleOf(Vertex, 3),
});

export const Mesh = object({
  faces: arrayOf(Polygon),
});

// Helpful for the top-most level element
export type Mesh = Parsed<typeof Mesh>;
