//
// Run with `npm run example:dog`
//

import bin from 'typed-binary';

// Describing the Dog schema
const Dog = bin.object({
  name: bin.string,
  position: bin.tupleOf([bin.f32, bin.f32, bin.f32]),
  age: bin.i32,
});

// Creating a type-alias for ease-of-use.
type Dog = bin.Parsed<typeof Dog>;

// Creating a 'Dog' object.
const dog: Dog = {
  position: [0, 1, 2],
  age: 123,
  name: 'Spikey',
};

console.log(dog);
