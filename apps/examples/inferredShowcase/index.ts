import * as bin from 'typed-binary';

// Describing the Dog schema.
const Dog = bin.struct({
  /** The name of the doggy. */
  name: bin.string,
  /** The dog's age in dog years. */
  age: bin.i32,
});

// Creating a type-alias for ease-of-use.
type Dog = bin.ExtractOut<typeof Dog>;

// Creating a 'Dog' object.
const dog: Dog = {
  name: 'Sammy',
  age: 15,
};

console.log(dog);
