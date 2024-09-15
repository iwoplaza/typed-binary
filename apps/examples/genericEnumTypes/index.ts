//
// Run with `npm run example:genericEnumTypes`
//

import bin from 'typed-binary';

enum AnimalType {
  DOG = 0,
  CAT = 1,
}

// Generic (enum) object schema
const Animal = bin.genericEnum(
  {
    nickname: bin.string,
    age: bin.i32,
  },
  {
    [AnimalType.DOG]: bin.object({
      // Animal can be a dog
      breed: bin.string,
    }),
    [AnimalType.CAT]: bin.object({
      // Animal can be a cat
      striped: bin.bool,
    }),
  },
);

// A buffer to serialize into/out of
const buffer = Buffer.alloc(16);
const writer = new bin.BufferWriter(buffer);
const reader = new bin.BufferReader(buffer);

// Writing an Animal
Animal.write(writer, {
  type: AnimalType.CAT, // We're specyfing which concrete type we want this object to be.

  // Base properties
  nickname: 'James',
  age: 5,

  // Concrete type specific properties
  striped: true,
});

// Deserializing the animal
const animal = Animal.read(reader);

// -- Type checking works here! --
// animal.type => AnimalType
if (animal.type === AnimalType.CAT) {
  // animal.type => AnimalType.CAT
  console.log("It's a cat!");
  // animal.striped => bool
  console.log(animal.striped ? 'Striped' : 'Not striped');
} else {
  // animal.type => AnimalType.DOG
  console.log("It's a dog!");
  // animal.breed => string
  console.log(`More specifically, a ${animal.breed}`);

  // This would result in a type error (Static typing FTW!)
  // console.log(`Striped: ${animal.striped}`);
}
