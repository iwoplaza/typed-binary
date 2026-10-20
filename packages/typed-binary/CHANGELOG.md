# Changelog

## Unreleased

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
