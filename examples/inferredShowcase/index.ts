import { type Parsed, i32, object, string } from 'typed-binary';

// Describing the Dog schema.
const Dog = object({
  /** The name of the doggy. */
  name: string,
  /** The dog's age in dog years. */
  age: i32,
});

// Creating a type-alias for ease-of-use.
type Dog = Parsed<typeof Dog>;

// Creating a 'Dog' object.
const dog: Dog = {
  name: 'Sammy',
  age: 15,
};

console.log(dog);
