//
// Run with `npm run example:unionTypes`
//

import * as bin from 'typed-binary';

// Tagged union, with the tag encoded as the index of the value in a single byte
const Animal = bin.union(
  bin.orderedEnum('dog', 'cat'),
  {
    // Animal can be a dog
    dog: { breed: bin.string },
    // Animal can be a cat
    cat: { striped: bin.bool },
  },
  // Properties shared by all variants
  { base: { nickname: bin.string, age: bin.i32 } },
);

// A buffer to serialize into/out of
const buffer = new ArrayBuffer(16);
const writer = new bin.BufferWriter(buffer);
const reader = new bin.BufferReader(buffer);

// Writing an Animal
Animal.write(writer, {
  type: 'cat', // We're specifying which variant we want this object to be.

  // Base properties
  nickname: 'James',
  age: 5,

  // Variant specific properties
  striped: true,
});

// Deserializing the animal
const animal = Animal.read(reader);

console.log(JSON.stringify(animal)); // { "type": "cat", "nickname": "James", "age": 5, "striped": true }

// -- Type checking works here! --
// animal.type => 'dog' | 'cat'
if (animal.type === 'cat') {
  // animal.type => 'cat'
  console.log("It's a cat!");
  // animal.striped => boolean
  console.log(animal.striped ? 'Striped' : 'Not striped');
} else {
  // animal.type => 'dog'
  console.log("It's a dog!");
  // animal.breed => string
  console.log(`More specifically, a ${animal.breed}`);

  // This would result in a type error (Static typing FTW!)
  // console.log(`Striped: ${animal.striped}`);
}

// Variants can also be keyed by a TypeScript enum, with the tag encoded as a number
enum ShapeType {
  CIRCLE = 0,
  RECT = 1,
}

const Shape = bin.union(bin.u8, {
  [ShapeType.CIRCLE]: { radius: bin.f32 },
  [ShapeType.RECT]: { width: bin.f32, height: bin.f32 },
});

const shapeBuffer = new ArrayBuffer(Shape.maxSize);
Shape.write(new bin.BufferWriter(shapeBuffer), { type: ShapeType.RECT, width: 2, height: 3 });
const shape = Shape.read(new bin.BufferReader(shapeBuffer));

if (shape.type === ShapeType.RECT) {
  // shape.width, shape.height => number
  console.log(`A ${shape.width}x${shape.height} rectangle`);
}
