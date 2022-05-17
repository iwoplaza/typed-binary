import { object, STRING, INT, Parsed } from 'typed-binary';

// Describing the Dog schema.
const Dog = object({
    /** The name of the doggy. */
    name: STRING,
    /** The dog's age in dog years. */
    age: INT,
});

// Creating a type-alias for ease-of-use.
type Dog = Parsed<typeof Dog>;

// Creating a 'Dog' object.
const dog: Dog = {
    name: 'Sammy',
    age: 15,
};
