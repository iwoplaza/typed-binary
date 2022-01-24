# Typed Binary
Gives tools to describe binary structures with full TypeScript support. Encodes and decodes into pure JavaScript objects, while giving type context for the parsed data.

## Features:
- Type-safe schemas (your IDE will know what structure the parsed binary is in).
- Generic objects
- Estimating the size of any resulting binary object (helpful for creating buffered storage)

## Workflow example
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

## Instalation
Using NPM:
```sh
$ npm i --save typed-binary
```
