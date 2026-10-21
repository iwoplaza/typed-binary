import * as bin from 'typed-binary';

export const Vertex = bin.struct({
  x: bin.i32,
  y: bin.i32,
  z: bin.i32,
});

export const Polygon = bin.struct({
  vertices: bin.array(Vertex, 3),
});

export const Mesh = bin.struct({
  faces: bin.dynamicArray(Polygon),
});

// Helpful for the top-most level element
export type Mesh = bin.ExtractOut<typeof Mesh>;
