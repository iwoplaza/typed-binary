# Changelog

## Unreleased (v5)

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
