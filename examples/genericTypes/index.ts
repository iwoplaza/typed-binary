//
// Run with `npm run example:genericTypes`
//

import {
  BufferWriter,
  BufferReader,
  i32,
  string,
  bool,
  generic,
  object,
} from 'typed-binary';

// Generic object schema
const Animal = generic(
  {
    nickname: string,
    age: i32,
  },
  {
    dog: object({
      // Animal can be a dog
      breed: string,
    }),
    cat: object({
      // Animal can be a cat
      striped: bool,
    }),
  },
);

// A buffer to serialize into/out of
const buffer = Buffer.alloc(16);
const writer = new BufferWriter(buffer);
const reader = new BufferReader(buffer);

// Writing an Animal
Animal.write(writer, {
  type: 'cat', // We're specyfing which concrete type we want this object to be.

  // Base properties
  nickname: 'James',
  age: 5,

  // Concrete type specific properties
  striped: true,
});

// Deserializing the animal
const animal = Animal.read(reader);

console.log(JSON.stringify(animal)); // { "age": 5, "striped": true ... }

// -- Type checking works here! --
// animal.type => 'cat' | 'dog'
if (animal.type === 'cat') {
  // animal.type => 'cat'
  console.log("It's a cat!");
  // animal.striped => bool
  console.log(animal.striped ? 'Striped' : 'Not striped');
} else {
  // animal.type => 'dog'
  console.log("It's a dog!");
  // animal.breed => string
  console.log(`More specifically, a ${animal.breed}`);

  // This would result in a type error (Static typing FTW!)
  // console.log(`Striped: ${animal.striped}`);
}
