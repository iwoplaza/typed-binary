# Typed Binary
<a href="https://twitter.com/ivesiris" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@ivesiris-4BBAAB.svg" alt="Created by Iwo Plaza"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/iwoplaza/typed-binary" alt="License"></a>
<a href="https://www.npmjs.com/package/typed-binary" rel="nofollow"><img src="https://img.shields.io/npm/dw/typed-binary.svg" alt="npm"></a>
<a href="https://www.npmjs.com/package/typed-binary" rel="nofollow"><img src="https://img.shields.io/github/stars/iwoplaza/typed-binary" alt="stars"></a>

Gives tools to describe binary structures with full TypeScript support. Encodes and decodes into pure JavaScript objects, while giving type context for the parsed data.

# Table of contents
- [Features](#features)
- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Running examples](#running-examples)
- [Defining schemas](#defining-schemas)
  - [Primitives](#primitives)
  - [Objects](#objects)
  - [Arrays](#arrays)
  - [Tuples](#tuples)
  - [Optionals](#optionals)
  - [Recursive types](#recursive-types)
- [Custom schema types](#custom-schema-types)
- [Serialization and Deserialization](#serialization-and-deserialization)

# Features:
- Type-safe schemas (your IDE will know what structure the parsed binary is in).
- Generic objects
- Estimating the size of any resulting binary object (helpful for creating buffered storage)

### Why Typed Binary over other libraries?
- It's one of the few libraries (if not the only one) with fully staticly-typed binary schemas.
- It has **zero-dependencies**.
- It's platform independent (use it in Node.js as well as in in Browsers)
- While being made with TypeScript in mind, it also works with plain JavaScript.

# Instalation
Using NPM:
```sh
$ npm i --save typed-binary
```

# Requirements
To properly enable type inference, **TypeScript 4.5** and up is required because of it's newly added [Tail-Recursion Elimination on Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types) feature,

# Basic usage
```ts
import { object, arrayOf, INT, STRING, BOOL, Parsed } from 'typed-binary';

const GameState = object({
    nickname: STRING,               // Variable-length string
    stage: INT,                     // 32-bit integer
    newGamePlus: BOOL,              // byte-encoded boolean
    collectables: arrayOf(STRING), // Variable-length string array
    powerUpgrades: object({        // Nested object
        health:   BOOL,
        strength: BOOL,
    }),
});

// Automatically generating the parsed type.
type GameState = Parsed<typeof GameState>;

//...

import { BufferReader, BufferWriter } from 'typed-binary';

/**
 * Responsible for retrieving the saved game state.
 * If none can be found, returns a default starting state.
 */
async function loadGameState(): Promise<GameState> {
    try {
        const buffer = await fs.readFile('./savedState.bin');
        const reader = new BufferReader(buffer);

        return GameState.read(reader);
    }
    catch (e) {
        // Returning the default state if no saved state found.
        return {
            nickname: "Default",
            stage: 1,
            newGamePlus: false,
            collectables: [],
            powerUpgrades: {
                health: false,
                strength: false,
            },
        };
    }
}

/**
 * Saves the game's state for future use.
 * @param state The state to save.
 */
async function saveGameState(state: GameState): Promise<void> {
    try {
        const buffer = Buffer.alloc(GameState.sizeOf(state));
        const writer = new BufferWriter(buffer);

        GameState.write(writer, state);
        await fs.writeFile('./savedState.bin', buffer);
    }
    catch (e) {
        console.error(`Error occurred during the saving process.`);
        console.error(e);
    }
}
```

# Running examples
There are a handful of examples provided. To run any one of them make sure to clone the [typed-binary](https://github.com/iwoplaza/typed-binary) repository first, then go into the `examples/` directory. To setup the examples environment, run `npm run link`, which will build the parent project and link it to dependencies of the child 'examples' project.

Pick an example that peaks interest, and run `npm run example:exampleName`.

# Defining schemas
## Primitives
There's a couple primitives to choose from:
- `BOOL` - an 8-bit value representing either `true` or `false`.
    - Encoded as `1` if true, and as `0` if false.
- `BYTE` - an 8-bit value representing an unsigned number between 0 and 255.
    - Encoded as-is
- `INT` - a 32-bit signed integer number container.
    - Encoded as-is
- `FLOAT` - a 32-bit signed floating-point number container.
    - Encoded as-is
- `STRING` - a variable-length string of ASCII characters.
    - A string of characters followed by a '\0' terminal character.
```ts
import { BufferWriter, BufferReader, BYTE, STRING } from 'typed-binary';

const buffer = Buffer.alloc(16);
const writer = new BufferWriter(buffer);
const reader = new BufferReader(buffer);

// Writing four bytes into the buffer
BYTE.write(writer, 'W'.charCodeAt(0));
BYTE.write(writer, 'o'.charCodeAt(0));
BYTE.write(writer, 'w'.charCodeAt(0));
BYTE.write(writer, 0);

console.log(STRING.read(reader)); // Wow
```

## Objects
Objects store their properties in key-ascending-alphabetical order, one next to another.
### Simple objects
```ts
import { BufferWriter, BufferReader, INT, STRING, object } from 'typed-binary';

const buffer = Buffer.alloc(16);
const writer = new BufferWriter(buffer);
const reader = new BufferReader(buffer);

// Simple object schema
const Person = object({
    firstName: STRING,
    lastName: STRING,
    age: INT,
});

// Writing a Person
Person.write(writer, {
    firstName: "John",
    lastName: "Doe",
    age: 43,
});

console.log(JSON.stringify(Person.read(reader).address)); // { "firstName": "John", ... }
```
### Generic objects
This feature allows for the parsing of a type that contains different fields depending on it's previous values. For example, if you want to store an animal description, certain animal types might have differing features from one another.

**Keyed by strings:**
```ts
import { BufferWriter, BufferReader, INT, STRING, BOOL, generic, object } from 'typed-binary';

// Generic object schema
const Animal = generic({
    nickname: STRING,
    age: INT,
}, {
    'dog': object({ // Animal can be a dog
        breed: STRING,
    }),
    'cat': object({ // Animal can be a cat
        striped: BOOL,
    }),
});

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
    console.log(animal.striped ? "Striped" : "Not striped");
}
else {
    // animal.type => 'dog'
    console.log("It's a dog!");
    // animal.breed => string
    console.log(`More specifically, a ${animal.breed}`);

    // This would result in a type error (Static typing FTW!)
    // console.log(`Striped: ${animal.striped}`);
}

```

**Keyed by an enum (byte):**
```ts
import { BufferWriter, BufferReader, INT, STRING, genericEnum, object } from 'typed-binary';

enum AnimalType = {
    DOG = 0,
    CAT = 1,
};

// Generic (enum) object schema
const Animal = genericEnum({
    nickname: STRING,
    age: INT,
}, {
    [AnimalType.DOG]: object({ // Animal can be a dog
        breed: STRING,
    }),
    [AnimalType.CAT]: object({ // Animal can be a cat
        striped: BOOL,
    }),
});

// ...
// Same as for the string keyed case
// ...

// -- Type checking works here! --
// animal.type => AnimalType
if (animal.type === AnimalType.CAT) {
    // animal.type => AnimalType.CAT
    console.log("It's a cat!");
    // animal.striped => bool
    console.log(animal.striped ? "Striped" : "Not striped");
}
else {
    // animal.type => AnimalType.DOG
    console.log("It's a dog!");
    // animal.breed => string
    console.log(`More specifically, a ${animal.breed}`);

    // This would result in a type error (Static typing FTW!)
    // console.log(`Striped: ${animal.striped}`);
}
```

## Arrays
First 4 bytes of encoding are the length of the array, then it's items next to one another.
```
import { INT, arrayOf } from 'typed-binary';

const IntArray = arrayOf(INT);
```

## Tuples
The items are encoded right next to each other. No need to store length information, as that's constant (built into the tuple).
```
import { FLOAT, tupleOf } from 'typed-binary';

const Vector2 = tupleOf(FLOAT, 2);
const Vector3 = tupleOf(FLOAT, 3);
const Vector4 = tupleOf(FLOAT, 4);
```

## Optionals
Optionals are a good way of ensuring that no excessive data is stored as binary.

They are encoded as:
-  `0` given `value === undefined`.
-  `1 encoded(value)` given `value !== undefined`.

```ts
import { BufferWriter, BufferReader, INT, STRING, object, optional } from 'typed-binary';

const buffer = Buffer.alloc(16);
const writer = new BufferWriter(buffer);
const reader = new BufferReader(buffer);

// Simple object schema
const Address = object({
    city: STRING,
    street: STRING,
    postalCode: STRING,
});

// Simple object schema (with optional field)
const Person = object({
    firstName: STRING,
    lastName: STRING,
    age: INT,
    address: optional(Address),
});

// Writing a Person (no address)
Person.write(writer, {
    firstName: "John",
    lastName: "Doe",
    age: 43,
});

// Writing a Person (with an address)
Person.write(writer, {
    firstName: "Jesse",
    lastName: "Doe",
    age: 38,
    address: {
        city: "New York",
        street: "Binary St.",
        postalCode: "11-111",
    },
});

console.log(JSON.stringify(Person.read(reader).address)); // undefined
console.log(JSON.stringify(Person.read(reader).address)); // { "city": "New York", ... }
```

## Recursive types
If you want an object type to be able to contain one of itself (recursion), then you have to start using **keyed** types. The basic pattern is this:

```ts
/**
 * Wrapping a schema with a 'keyed' call allows the inner code to
 * use a reference to the type we're currently creating, instead
 * of the type itself.
 * 
 * The reference variable 'Recursive' doesn't have to be called
 * the same as the actual variable we're storing the schema in,
 * but it's a neat trick that makes the schema code more readable.
 * 
 * The 'recursive-key' has to uniquely identify this type in this tree.
 * There may be other distinct types using the same key, as long as they do
 * not interact with each other (one doesn't contain the other).
 * This is because references are resolved recursively once the method
 * passed as the 2nd argument to 'keyed' returns the schema.
 */
const Recursive = keyed('recursive-key', (Recursive) => object({
    value: INT,
    next: optional(Recursive),
}))
```

### Recursive types alongside generics
```ts
import { INT, STRING, object, keyed } from 'typed-binary';

type Expression = Parsed<typeof Expression>;
const Expression = keyed('expression', (Expression) => generic({}, {
    'multiply': object({
        a: Expression,
        b: Expression,
    }),
    'negate': object({
        inner: Expression,
    }),
    'int_literal': object({
        value: INT,
    }),
}));

const expr: Parsed<typeof Expression> = {
    type: 'multiply',
    a: {
        type: 'negate',
        inner: {
            type: 'int_literal',
            value: 15,
        }
    },
    b: {
        type: 'int_literal',
        value: 2,
    },
};

```

# Custom schema types
Custom schema types can be defined. They are, under the hood, classes that extend the `Schema<T>` base class. The generic `T` type represents what kind of data this schema serializes from and deserializes into.

```ts
import { ISerialInput, ISerialOutput, Schema, IRefResolver } from 'typed-binary';

/**
 * A schema storing radians with 2 bytes of precision.
 */
class RadiansSchema extends Schema<number> {
    resolve(ctx: IRefResolver): void {
        // No inner references to resolve
    }

    read(input: ISerialInput): number {
        const low = input.readByte();
        const high = input.readByte();

        const discrete = (high << 8) | low;
        return discrete / 65535 * Math.PI;
    }

    write(output: ISerialOutput, value: number): void {
        // The value will be wrapped to be in range of [0, Math.PI)
        const wrapped = ((value % Math.PI) + Math.PI) % Math.PI;
        // Discretising the value to be ints in range of [0, 65535]
        const discrete = Math.min(Math.floor(wrapped / Math.PI * 65535), 65535);

        const low = discrete & 0xFF;
        const high = (discrete >> 8) & 0xFF;

        output.writeByte(low);
        output.writeByte(high);
    }

    sizeOf(_: number): number {
        // The size of the data serialized by this schema
        // doesn't depend on the actual value. It's always 2 bytes.
        return 2;
    }
}

// Creating a singleton instance of the schema,
// since it has no configuration properties.
export const RADIANS = new RadiansSchema();
```

# Serialization and Deserialization
Each schema has the following methods:
```ts
/**
 * Writes the value (according to the schema's structure) to the output.
 */
write(output: ISerialOutput, value: T): void;
/**
 * Reads a value (according to the schema's structure) from the input.
 */
read(input: ISerialInput): T;
/**
 * Estimates the size of the value (according to the schema's structure)
 */
sizeOf(value: T): number;
```

The `ISerialInput/Output` interfaces have a basic built-in implementation that reads/writes to a buffer:
```ts
import { BufferReader, BufferWriter } from 'typed-binary';

// Creating a fixed-length buffer of arbitrary size (64 bytes).
const buffer = Buffer.alloc(64); // Or new ArrayBuffer(64); on browsers.

const reader = new BufferReader(buffer); // Implements ISerialInput
const writer = new BufferWriter(buffer); // Implements ISerialOutput
```
