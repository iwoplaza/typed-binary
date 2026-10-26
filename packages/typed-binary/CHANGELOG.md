# Changelog

## Unreleased (v5)

v5 reworks how schemas are defined and typed, makes recursion a matter of plain getters, replaces the buffer reader and
writer with a lightweight cursor, and adds primitives for data whose layout depends on previously encoded values.
The binary encoding of existing schemas is unchanged.

### Migrating from v4

| v4                                       | v5                                                   |
| ---------------------------------------- | ---------------------------------------------------- |
| `import bin from 'typed-binary'`         | `import * as bin from 'typed-binary'`                |
| `import { bin } from 'typed-binary'`     | `import * as bin from 'typed-binary'`                |
| `bin.object({ ... })`                    | `bin.struct({ ... })`                                |
| `bin.arrayOf(schema, length)`            | `bin.array(schema, length)`                          |
| `bin.dynamicArrayOf(schema)`             | `bin.dynamicArray(schema)`                           |
| `bin.tupleOf([...])`                     | `bin.tuple([...])`                                   |
| `bin.byte`                               | `bin.u8`                                             |
| `bin.keyed('key', (Self) => ...)`        | A getter referencing the schema, see below           |
| `bin.generic(base, variants)`            | `bin.union(bin.string, variants, { base })`          |
| `bin.genericEnum(base, variants)`        | `bin.union(bin.u8, variants, { base })`              |
| `bin.Parsed<typeof Schema>`              | `bin.ExtractOut<typeof Schema>` (or `bin.ExtractIn`) |
| `class X extends Schema<T>`              | `class X implements bin.Schema<T>`                   |
| `bin.ObjectSchema`, `bin.Uint8Schema`, … | `bin.Struct`, `bin.Uint8`, … (types only)            |
| `new bin.BufferWriter(buffer, options)`  | `bin.cursor(buffer, options)`                        |
| `new bin.BufferReader(buffer, options)`  | `bin.cursor(buffer, options)`                        |
| `bin.ISerialInput`, `bin.ISerialOutput`  | `bin.ByteCursor`                                     |
| `output.writeUint32(value)` (etc.)       | `bin.u32.write(cursor, value)`                       |
| `input.readUint32()` (etc.)              | `bin.u32.read(cursor)`                               |
| `writeSlice(view)`, `readSlice(view, …)` | `bin.u32Array(length).write(cursor, view)` (etc.)    |
| `io.currentByteOffset`                   | `cursor.offset`                                      |
| `io.seekTo(offset)`, `io.skipBytes(n)`   | `cursor.offset = offset`, `cursor.offset += n`       |
| `io.endianness`                          | `cursor.littleEndian`                                |
| `schema.measure(value).size`             | `schema.measure(value)`                              |

The replacements in the table encode data the same way as the v4 APIs they replace.

### Breaking changes

- **Namespace import instead of a default export.** The default export and the `bin` named export are removed.
  `import * as bin from 'typed-binary'` tree-shakes in every bundler, including esbuild (which couldn't tree-shake
  `bin.*` in v4). Named imports (`import { struct, u32 } from 'typed-binary'`) work too.
- **Renamed schemas.** `object` → `struct`, `arrayOf` → `array`, `dynamicArrayOf` → `dynamicArray`, `tupleOf` → `tuple`.
  The deprecated `byte` alias is removed, use `u8`.
- **`Schema` is an interface with separate input and output types.** In `Schema<TIn, TOut>`, `TIn` is what `write()`
  and `measure()` accept, and `TOut` is what `read()` returns. `bin.Parsed` is replaced by `bin.ExtractOut` and
  `bin.ExtractIn`. Input types of structs and arrays are readonly, so readonly data can be written. Custom schemas
  implement `bin.Schema<T>` (`read`, `write` and `measure`) instead of extending a base class, and `seekProperty()`,
  `resolveReferences()` and `PropertyDescription` are removed.
- **Schema classes are no longer exported.** Each schema is described by an exported type instead (`bin.Struct`,
  `bin.Uint8`, `bin.Array`, `bin.TypedArray`, ...).
- **Recursion is done with getters.** `bin.keyed`, `Ref`, `IRefResolver`, `KeyedSchema` and `UnresolvedReferenceError`
  are removed. A struct property (or a `bin.union` variant property) defined as a getter can reference the schema it
  belongs to:
  ```ts
  const LinkedList = bin.struct({
    value: bin.i32,
    get next() {
      return bin.optional(LinkedList);
    },
  });
  ```
- **`bin.generic` and `bin.genericEnum` are replaced by `bin.union`** (along with `SubTypeKey` and `GenericObjectSchema`).
  Unlike `bin.generic`, a union tagged by `bin.string` has a bounded max size, as the tag can only be one of the variants.
- **A byte cursor replaces `BufferReader`, `BufferWriter`, `ISerialInput` and `ISerialOutput`.** A `bin.ByteCursor` is
  a plain `{ view: DataView, offset: number, littleEndian: boolean }` object, used for both reading and writing,
  created with `bin.cursor(buffer, { byteOffset?, endianness? })` or by hand. Each schema reads and writes its own bytes,
  so an app only bundles the schemas it uses. Writing a `bin.struct({ a: bin.u32 })` went from 3,657 B to 1,541 B
  (esbuild, minified).
  - Custom schemas implement `read(cursor)` and `write(cursor, value)`, delegating to other schemas
    (`bin.u8.read(cursor)`) or using `cursor.view` directly. Custom `ISerialInput`/`ISerialOutput` implementations
    are no longer supported.
  - A cursor views an `ArrayBuffer` or `SharedArrayBuffer`, which can be resizable to support streaming.
  - **Offsets are relative to the given view.** For a typed array or a Node.js `Buffer`, `cursor.offset` (and the
    `byteOffset` option) counts from the start of that view, not from the start of the underlying `ArrayBuffer`.
    Reads and writes can no longer go past the end of the view.
- **`schema.measure(value)` returns a number of bytes.** It no longer takes or returns a measurer, and `bin.Measurer`
  and `bin.IMeasurer` are removed. `schema.measure(bin.MaxValue)` returns `NaN` for unbounded schemas (instead of
  `measurer.isUnbounded`). Custom schemas return a number from `measure()`.
- **Error messages are left out of production builds.** `ValidationError` and `InvalidSchemaShapeError` only carry
  detailed messages when `process.env.NODE_ENV !== 'production'`. The checks still run in production, and throw with a
  generic message.
- **The package is ESM-only.** The CommonJS build (`dist/index.cjs`) is removed. Node.js can still
  `require('typed-binary')` since v20.19 and v22.12. The `typed-binary/index` subpath export is removed too.
- **Internal type helpers are removed:** `ISchema`, `AnySchema`, `AnySchemaWithProperties`, `ISchemaWithProperties`,
  `AnyObjectSchema`, `IKeyedSchema`, `AnyKeyedSchema`, `Unwrap`, `UnwrapRecord`, `UnwrapArray` and `ParseUnwrapped`.
  Use `bin.Schema`, `bin.ExtractIn` and `bin.ExtractOut` instead.

### New features

- `bin.union(tag, variants, options?)`: tagged unions. The tag can be any schema (e.g. `bin.u8`, `bin.string` or
  `bin.orderedEnum(...)`), variants can be structs or property records, `base` adds properties shared by all variants,
  and `key` renames the tag property. The max size is exact, measured per variant.
- `bin.pipe(head, action)`: reads/writes `head`, then the schema returned by `action(headValue)`, for data whose layout
  depends on previously encoded values. When writing, `action` receives the written value, so the type `head` reads has
  to be assignable to the type it accepts. When measuring the max size, `action` receives `bin.MaxValue`, and the result
  is an upper bound.
- `bin.inherent(value)`: a zero-byte schema for a value known from context, e.g. carried over from the head of a `bin.pipe`.
- `bin.orderedEnum(...values)`: a string enum encoded as the index of the value, in a single byte.
- `bin.prefixEnum(...values)`: a string enum encoded as the ASCII characters of the value, with no terminator, so the
  encoding doesn't depend on the order of values. Values can't be prefixes of each other.
- `bin.i64` and `bin.u64`: 64-bit integers, read and written as `bigint`. Like the other integers, out-of-range values
  wrap around.
- Objects can act as schemas by holding one under the `'~typed-binary'` key (`{ '~typed-binary': { schema } }`, typed
  as `bin.WithSchema`). They are accepted wherever a schema is expected.
- `bin.InvalidSchemaShapeError` is thrown when something other than a schema is passed where one is expected, or when
  an enum is defined with invalid values.
- `bin.string.maxSize` (always `NaN`, as strings are unbounded).

### Fixes

- Measuring the max size of a recursive schema returns `NaN` (unbounded), instead of overflowing the stack.

## Unreleased

## 4.3.5 (2026-10-27)

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
