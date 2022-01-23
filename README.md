# Typed Binary
Gives tools to describe binary structures with full TypeScript support. Encodes and decodes into pure JavaScript objects, while giving type context for the parsed data.

## Simple objects
```ts
import { object, arrayOf, INT, STRING, BOOL } from 'typed-binary';

const GAME_STATE = object({
    nickname: STRING,               // Variable-length string
    stage: INT,                     // 32-bit integer
    newGamePlus: BOOL,              // byte-encoded boolean
    collectables: arrayOf(STRING), // Variable-length string array
    powerUpgrades: object({        // Nested object
        health:   BOOL,
        strength: BOOL,
    }),
});

//...

import { readSerial, writeSerial } from 'typed-binary';

const gameState = readSerial({}, input, GAME_STATE);


```

## Example
```ts
import { generic, concreteOf, INT, STRING } from 'typed-binary';

const HOUSE_ANIMAL =
    generic('animal' as const, {
        age: INT,
        nickname: STRING,
    });

const DOG =
    concreteOf(ANIMAL, 'dog' as const, {
        dogBreed: STRING,
    });

```

## Instalation
Using NPM:
```sh
$ npm i --save typed-binary
```