import bin from 'typed-binary';

export const Vertex = bin.object({
  x: bin.i32,
  y: bin.i32,
  z: bin.i32,
});

export const Polygon = bin.object({
  vertices: bin.arrayOf(Vertex, 3),
});

export const Mesh = bin.object({
  faces: bin.dynamicArrayOf(Polygon),
});

// Helpful for the top-most level element
export type Mesh = bin.Parsed<typeof Mesh>;
