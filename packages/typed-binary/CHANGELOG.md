# Changelog

## Unreleased (v5)

### TODO

- [x] Update README code images
- [x] Make `getSystemEndianness` part of `main-api.ts`, and since that was the only thing that wasn't part of the public API, merge `main-api.ts` into `index.ts`
- [x] Remove the `I` prefix from public interfaces
- [x] Unify names of classes to `*Impl`
- [x] Let schema implementations implement their interface, not the plain `Schema<...>` interface
- [x] Convert `TypedArraySchema` to an exported `TypedArray<T>` interface and an internal `TypedArrayImpl` class, and remove its leftover `$in`/`$out` fields
- [x] Replace `BufferReader`/`BufferWriter` (and `SerialInput`/`SerialOutput`) with `bin.cursor()`/`bin.ByteCursor`, for better tree-shaking

v5 reworks how schemas are defined and typed, makes recursion a matter of plain getters, and adds primitives
for data whose layout depends on previously encoded values. The binary encoding of existing schemas is unchanged.

### Migrating from v4

| v4                                       | v5                                                    |
| ---------------------------------------- | ----------------------------------------------------- |
| `bin.object({ ... })`                    | `bin.struct({ ... })`                                 |
| `bin.arrayOf(schema, length)`            | `bin.array(schema, length)`                           |
| `bin.dynamicArrayOf(schema)`             | `bin.dynamicArray(schema)`                            |
| `bin.tupleOf([...])`                     | `bin.tuple([...])`                                    |
| `bin.byte`                               | `bin.u8`                                              |
| `bin.Parsed<typeof Schema>`              | `bin.ExtractOut<typeof Schema>` (or `bin.ExtractIn`)  |
| `bin.keyed('key', (Self) => ...)`        | A getter referencing the schema, see below            |
| `bin.generic(base, variants)`            | `bin.union(bin.string, variants, { base })`           |
| `bin.genericEnum(base, variants)`        | `bin.union(bin.u8, variants, { base })`               |
| `class X extends Schema<T>`              | `class X implements bin.Schema<T>`                    |
| `import bin from 'typed-binary'`         | `import * as bin from 'typed-binary'`                 |
| `import { bin } from 'typed-binary'`     | `import * as bin from 'typed-binary'`                 |
| `new bin.BufferWriter(buffer, options)`  | `bin.cursor(buffer, options)`                         |
| `new bin.BufferReader(buffer, options)`  | `bin.cursor(buffer, options)`                         |
| `bin.ISerialInput`, `bin.ISerialOutput`  | `bin.ByteCursor`                                      |
| `output.writeUint32(value)` (etc.)       | `bin.u32.write(cursor, value)`                        |
| `input.readUint32()` (etc.)              | `bin.u32.read(cursor)`                                |
| `writeSlice(view)`, `readSlice(view, …)` | `bin.u32Array(length).write(cursor, view)` (etc.)     |
| `io.currentByteOffset`                   | `cursor.offset`                                       |
| `io.seekTo(offset)`, `io.skipBytes(n)`   | `cursor.offset = offset`, `cursor.offset += n`        |
| `io.endianness`                          | `cursor.littleEndian`                                 |
| `bin.IMeasurer`                          | `bin.Measurer`                                        |

The replacements in the table encode data the same way as the v4 schemas they replace.

### Breaking changes

- **Removed the default export and the `bin` named export.** Import the library as a namespace instead
  (`import * as bin from 'typed-binary'`), which every bundler, including esbuild, tree-shakes as well as named imports
  (in v4, esbuild couldn't tree-shake `bin.*` member access at all). Named imports (e.g. `import { struct, u32 } from 'typed-binary'`)
  work too, with the renames listed in the table above.
- **Schema classes are no longer exported** (`ObjectSchema`, `Uint8Schema`, `ArraySchema`, ...). Use the types describing each schema instead
  (`bin.Struct`, `bin.Uint8`, `bin.Array`, ...). `TypedArraySchema` is replaced by the `bin.TypedArray` interface.
- **Schemas have separate input and output types.** `Schema<TIn, TOut>` is now an interface instead of a base class, where `TIn` is the type
  of values accepted when writing (and measuring), and `TOut` the type of values produced when reading. `bin.Parsed` is replaced by
  `bin.ExtractOut`, and `bin.ExtractIn` is added. Input types of structs and arrays are readonly, so readonly data can be written.
  Custom schemas implement `bin.Schema<T>` instead of extending `Schema<T>`.
- **Recursion is done with getters.** `bin.keyed`, along with `Ref`, `IRefResolver`, `KeyedSchema` and `UnresolvedReferenceError`,
  is removed. A struct property (or a `bin.union` variant property) defined as a getter can reference the schema it belongs to:
  ```ts
  const LinkedList = bin.struct({
    value: bin.i32,
    get next() {
      return bin.optional(LinkedList);
    },
  });
  ```
- **Removed `bin.generic` and `bin.genericEnum`** (and `SubTypeKey`, `GenericObjectSchema`) in favor of `bin.union`.
  Unlike `bin.generic`, a union tagged by `bin.string` has a bounded max size, as the tag can only be one of the variants.
- **Renamed** `bin.object` to `bin.struct`, `bin.arrayOf` to `bin.array`, `bin.dynamicArrayOf` to `bin.dynamicArray` and
  `bin.tupleOf` to `bin.tuple`. Removed `bin.byte` (deprecated alias of `bin.u8`).
- **Replaced `BufferReader`, `BufferWriter`, `ISerialInput` and `ISerialOutput` with a byte cursor.** Schemas read from and write to
  a `bin.ByteCursor`, a plain `{ view: DataView, offset: number, littleEndian: boolean }` object created with
  `bin.cursor(buffer, { byteOffset?, endianness? })` (or by hand), and the same cursor type is used for reading and writing.
  The reading and writing of each primitive now lives in its schema, so an app only bundles the primitives it uses. Previously, using
  `BufferWriter` bundled every one of its methods, including the UTF-8 encoding of strings and the byte swapping of typed arrays.
  Writing a `bin.struct({ a: bin.u32 })` went from 3,657 B to 1,943 B (esbuild, minified).
  - Custom schemas implement `read(cursor: bin.ByteCursor)` and `write(cursor: bin.ByteCursor, value)`, and either delegate to the
    primitive schemas (`bin.u8.read(cursor)`) or use `cursor.view` directly. Custom implementations of `ISerialInput`/`ISerialOutput`
    are no longer supported. A cursor views an `ArrayBuffer` (or `SharedArrayBuffer`), which can be resizable to support streaming.
  - **Offsets are relative to the given view.** Given a typed array or a Node.js `Buffer`, `cursor.offset` counts from the start of
    that view, whereas `currentByteOffset` (and `byteOffset` in the options) counted from the start of the underlying `ArrayBuffer`.
    Reads and writes can no longer go past the end of the given view.
- **Renamed `IMeasurer` to `Measurer`.** `Measurer` is both the interface and the constructor of the built-in measurer,
  so `new bin.Measurer()` still works.
- **Removed the internal type helpers** `ISchema`, `AnySchema`, `AnySchemaWithProperties`, `ISchemaWithProperties`, `AnyObjectSchema`,
  `IKeyedSchema`, `AnyKeyedSchema`, `Unwrap`, `UnwrapRecord`, `UnwrapArray` and `ParseUnwrapped`. Use `bin.Schema`, `bin.ExtractIn` and
  `bin.ExtractOut` instead.

### New features

- `bin.union(tag, variants, options?)`: tagged unions with any schema as the tag (e.g. `bin.orderedEnum(...)`, `bin.u8` or `bin.string`),
  optional `base` properties shared by all variants, a custom name for the tag property (`key`), and structs or property records as variants.
  Their max size is exact, measured per variant.
- `bin.pipe(head, action)`: reads/writes `head`, then the schema returned by `action(headValue)`, for data whose layout depends on
  previously encoded values. `action` receives `bin.MaxValue` when the max size is being measured.
  The max size of a pipe is an upper bound, as the head and the rest of the data are measured independently.
  The value read by the head has to be assignable to the value it accepts, as `action` receives the written value when writing.
- `bin.inherent(value)`: a zero-byte schema for values already known from context, e.g. carried over from the head of a `bin.pipe`.
- `bin.orderedEnum(...values)`: a string enum encoded as the index of the value, in a single byte.
- `bin.prefixEnum(...values)`: a string enum encoded as the ASCII characters of the value, with no terminator, independent of
  the order of values. Values cannot be prefixes of each other.
- Each schema has an exported type describing it (`bin.Struct`, `bin.Array`, `bin.Optional`, `bin.Int32`, `bin.Union`, ...).
- `bin.InvalidSchemaShapeError` is thrown when a non-schema is passed where a schema is expected.
- Objects can define themselves as schemas by holding one under the `'~typed-binary'` key
  (`{ '~typed-binary': { schema } }`, described by `bin.WithSchema`). They are accepted wherever a schema is expected,
  including struct properties, `bin.tuple`, `bin.concat` and the tag and variants of `bin.union`.
- `bin.string.maxSize` (always `NaN`, as strings are unbounded).
- `maxSize` is declared on the `bin.Array`, `bin.DynamicArray` and `bin.Optional` types (it was only available at runtime).

### Fixes

- Measuring the max size of recursive schemas returns `NaN` (unbounded), instead of overflowing the stack.

## Unreleased

- Fixed: `maxSize`/`.measure(MaxValue)` of schemas containing an unbounded schema
  (e.g. `string` or `dynamicArrayOf(...)`) is now `NaN`. Previously, containers like `object`,
  `optional` or `tupleOf` ignored the unboundedness of their members, and reported only the
  size of the bounded ones (e.g. `8` for `object({ a: i32, b: string, c: i32 })`).
- Fixed: `genericEnum` now considers an unbounded sub-type to be the biggest one when measuring
  its max size.
- Fixed: `BufferReader` and `BufferWriter` accept array buffer views (e.g. a Node.js `Buffer`)
  in their types, as they already did at runtime. Previously, `new BufferWriter(Buffer.alloc(64))`
  failed to typecheck with recent TypeScript versions.

## 4.3.4 (2026-10-20)

### Bundles now contain only what you import

`typed-binary` is now fully tree-shakeable. Previously, importing any single export
(e.g. `getSystemEndianness` or `BufferWriter`) pulled in almost the whole library (~15 kB minified).
Now an app ships only the exports it uses and what they depend on:

| Imported (esbuild, minified) | before    | after    |
| ---------------------------- | --------- | -------- |
| `getSystemEndianness`        | 14,947 B  | 143 B    |
| `Measurer`                   | 14,947 B  | 244 B    |
| `BufferWriter`               | 14,947 B  | 2,214 B  |
| `u32`, `object`              | 14,954 B  | 1,310 B  |

`import bin from 'typed-binary'` followed by `bin.object(...)`/`bin.u32` is now tree-shaken
too in Rollup, Rolldown (Vite) and webpack, to the same size as named imports.
esbuild does not tree-shake namespace member access, so prefer named imports there.

Under the hood:

- The ES module build is now emitted by `tsc`, one file per source module, targeting ES2022
  (the CommonJS build is still a single `dist/index.cjs`).
- `bin` and the default export are re-exported with `export * as … from`, instead of being built
  as an object eagerly.
- Top-level schema singletons (`u32`, `string`, …) are annotated as `/* @__PURE__ */`.

There are no changes to the runtime behavior or the public types.

## 4.3.3 (2026-03-13)

**Behavior change:** `writeSlice`/`readSlice` (and so the typed array schemas) now respect the
endianness the reader/writer was configured with. A `Float32Array` is encoded as a series of
float32 values in the target endianness, instead of in the system's endianness as before.
To keep the old behavior, convert typed arrays to a `Uint8Array` view before serializing or
deserializing them.

- Float16 values are read and written with the now baseline `DataView.getFloat16`/`setFloat16`.
- Bumped TypeScript to v5.9.3.

## 4.3.2 (2025-01-18)

- Pure functions are annotated with `@__NO_SIDE_EFFECTS__` for better tree-shaking.

## 4.3.1 (2024-12-21)

- Fixed: the `Schema` class is exported as a value, not just as a type, so it can be extended.

## 4.3.0 (2024-12-18)

- Added the missing numeric schemas: `u8`, `i8`, `u16` and `i16`.
- Deprecated `byte`/`ByteSchema` in favor of `u8`/`Uint8Schema`, and `readByte`/`writeByte`
  in favor of `readUint8`/`writeUint8`.
- `BufferReader` and `BufferWriter` now use a `DataView` internally.
- Imports in the source use `.ts` extensions, and exported functions have explicit return types.

## 4.2.0 (2024-10-29)

- Added `f16` (`Float16Schema`).

## 4.1.1 (2024-10-05)

- Fixed: UTF-8 strings are now encoded and decoded properly.
- Fixed: `BufferWriter` respects the view's length when writing a slice.

## 4.1.0 (2024-09-16)

- Added typed array schemas: `u8Array`, `u8ClampedArray`, `u16Array`, `u32Array`, `i8Array`,
  `i16Array`, `i32Array`, `f32Array` and `f64Array`.
- Added a default export and a `bin` named export with the whole schema API
  (`import bin from 'typed-binary'`).
- Added a `maxSize` property to some schemas (alias for `.measure(MaxValue).size`).
- New docs website: https://iwoplaza.github.io/typed-binary/
- Internal: the repository is now a monorepo, with E2E browser compatibility tests.

## 4.0.1 (2024-07-18)

- Fixed: invalid typing of the `BufferReader`/`BufferWriter` options.

## 4.0.0 (2024-03-01)

**Breaking changes:**

- Arrays were renamed to match what they are:
  - `arrayOf(schema)` (length-prefixed) is now `dynamicArrayOf(schema)` (`DynamicArraySchema`).
  - `tupleOf(schema, length)` (fixed length) is now `arrayOf(schema, length)` (`ArraySchema`).
  - `tupleOf([a, b, c])` now creates an actual tuple of differently typed elements (`TupleSchema`).
- `TypedBinaryError` was replaced by `UnresolvedReferenceError` and `ValidationError`.
- `ISchema.resolve` was renamed to `resolveReferences`.
- `isBigEndian()` was replaced by `getSystemEndianness()`.
- Simplified type declarations: schemas are now typed by their schema types (e.g.
  `object<P extends Record<string, AnySchema>>`) instead of the values they hold, and the
  `SchemaMap`/`IStableSchema` helper types were removed.

Other changes:

- Better type unwrapping of compound and keyed schemas.
- `BufferReader`/`BufferWriter` expose the resolved `endianness`, and gained `seekTo(offset)`.
- Migrated tests to Vitest.

## 3.2.0 (2023-12-25)

- Added `concat([...objectSchemas])`, which merges the properties of several object schemas.

## 3.1.0 (2023-12-25)

- Fixed: the outer buffer's byte offset is applied when unwrapping a buffer view
  (e.g. a Node.js `Buffer` from a pool).
- Updated the documentation.

## 3.0.0 (2023-11-26)

**Breaking:** `schema.sizeOf(value)` was replaced by `schema.measure(value, measurer?)`,
which returns an `IMeasurer` (read its `.size`).

- Schemas can measure their maximum size with `schema.measure(MaxValue)`. Unbounded schemas
  (strings, dynamic arrays) report `NaN` (`measurer.isUnbounded`).
- Added the `Measurer` class and the `IMeasurer` type.
- Added `skipBytes(bytes)` to `ISerialInput`/`ISerialOutput`.

## 2.0.0 (2023-09-10)

**Breaking:** base types are now lowercase and explicit about precision and sign:
`BOOL` → `bool`, `STRING` → `string`, `BYTE` → `byte`, `INT` → `i32`, `FLOAT` → `f32`.

- Added `u32`.

## 1.2.2 (2023-08-04)

- `BufferReader`/`BufferWriter` accept options: `byteOffset` and `endianness`
  (`'big'`, `'little'` or `'system'`).

## 1.2.1 (2023-08-04)

- Fixed: `Buffer` is no longer referenced on the web.

## 1.2.0 (2022-05-08)

- A new pattern for recursive types.
- Exposed the APIs for creating custom schemas.

## 1.1.1 (2022-01-25)

- Removed the redundant `TypeToken`.
- Added a `typedGenericEnum` descriptor.

## 1.1.0 (2022-01-25)

- Object properties are now stored in insertion order.
- Added support for recursive types.

## 1.0.0 (2022-01-24)

- First release of typed-binary.
