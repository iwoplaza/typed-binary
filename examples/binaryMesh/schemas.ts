import type { Parsed } from 'typed-binary';
import { arrayOf, dynamicArrayOf, i32, object } from 'typed-binary';

export const Vertex = object({
  x: i32,
  y: i32,
  z: i32,
});

export const Polygon = object({
  vertices: arrayOf(Vertex, 3),
});

export const Mesh = object({
  faces: dynamicArrayOf(Polygon),
});

// Helpful for the top-most level element
export type Mesh = Parsed<typeof Mesh>;
