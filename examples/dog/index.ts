//

import { object, tupleOf, string, i32, f32, Parsed } from 'typed-binary';

// Describing the Dog schema
const Dog = object({
  name: string,
  position: tupleOf([f32, f32, f32]),
  age: i32,
});

// Creating a type-alias for ease-of-use.
type Dog = Parsed<typeof Dog>;

// Creating a 'Dog' object.
const dog: Dog = {
  position: [0, 1, 2],
  age: 123,
  name: 'Spikey',
};

console.log(dog);
