// Bundles small apps that each import a few typed-binary exports, and prints how much
// of the library ends up in them. Run after building:
//   `node scripts/treeshake-check.mjs [packageDir] [--check]`
// With `--check`, exits with a non-zero code if any case exceeds its budget.
import { build, transform } from 'esbuild';
import { resolve } from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';
import { rolldown } from 'rolldown';
import { rollup } from 'rollup';

const args = process.argv.slice(2);
const enforce = args.includes('--check');
const pkgDir = resolve(args.find((a) => !a.startsWith('--')) ?? '.');
const entry = resolve(pkgDir, 'dist/index.js'); // the ESM entry from package.json "exports"

// Budgets are minified bytes, with some headroom over the sizes at the time of writing.
// A case blowing past its budget usually means a top-level side effect was (re)introduced.
const cases = {
  'nothing used': {
    budget: 50,
    code: `import { struct } from 'tb'; globalThis.x = 1;`,
  },
  getSystemEndianness: {
    budget: 200,
    code: `import { getSystemEndianness } from 'tb'; globalThis.x = getSystemEndianness;`,
  },
  cursor: {
    budget: 550,
    code: `import { cursor } from 'tb'; globalThis.x = cursor;`,
  },
  'TypeGPU set': {
    budget: 800,
    code: `import { cursor, getSystemEndianness } from 'tb';
    globalThis.x = [cursor, getSystemEndianness];`,
  },
  'u32 + struct': {
    budget: 1700,
    code: `import { u32, struct } from 'tb'; globalThis.x = struct({ a: u32 });`,
  },
  // The recommended way of importing, which should cost the same as named imports.
  'bin.struct/bin.u32': {
    budget: 1700,
    code: `import * as bin from 'tb'; globalThis.x = bin.struct({ a: bin.u32 });`,
  },
  // Writing through a cursor only bundles the primitives that are used. When the IO layer was
  // a pair of classes, this pulled in every read/write method, including the text codecs.
  'struct write': {
    budget: 2300,
    code: `import { cursor, struct, u32 } from 'tb';
    const S = struct({ a: u32 }); globalThis.x = (buf) => S.write(cursor(buf), { a: 1 });`,
  },
  'string write': {
    budget: 1700,
    code: `import { cursor, string } from 'tb';
    globalThis.x = (buf) => string.write(cursor(buf), 'hello');`,
  },
  'u32Array write': {
    budget: 1850,
    code: `import { cursor, u32Array } from 'tb';
    globalThis.x = (buf) => u32Array(4).write(cursor(buf), new Uint32Array(4));`,
  },
  // Schemas that are created but never used should be dropped, which relies on the factories
  // being annotated with `@__NO_SIDE_EFFECTS__`. esbuild only honors that annotation for calls
  // within the same module, so it retains them (hence the large budget). Rolldown drops them
  // only thanks to the annotations (rollup drops them even without, by analyzing the factories).
  'unused schemas': {
    budget: 12000,
    code: `import * as bin from 'tb';
    const S = bin.struct({
      a: bin.u32, s: bin.string, c: bin.chars(4), arr: bin.array(bin.f32, 3),
      d: bin.dynamicArray(bin.u8), o: bin.optional(bin.i16), t: bin.tuple([bin.u8, bin.u16]),
    });
    const U = bin.union(bin.string, { a: { x: bin.u32 } }, { base: { id: bin.u8 } });
    const P = bin.pipe(bin.u8, () => bin.u32Array(4));
    const C = bin.concat([S, bin.struct({ b: bin.bool })]);
    const E = [bin.prefixEnum('a', 'b'), bin.orderedEnum('a', 'b'), bin.inherent(1)];
    const cur = bin.cursor(new ArrayBuffer(4));
    globalThis.x = 1;`,
  },
  'unused recursive': {
    budget: 2300,
    code: `import * as bin from 'tb';
    const Node = bin.struct({ value: bin.u32, get next() { return bin.optional(Node); } });
    globalThis.x = 1;`,
  },
  // Using the namespace as a value (instead of accessing its members) retains the whole library.
  'whole namespace': {
    budget: 16000,
    code: `import * as bin from 'tb'; globalThis.x = bin;`,
  },
};

// Rollup and Rolldown tree-shake namespace member access and cross-module `@__NO_SIDE_EFFECTS__`.
const rollupCases = {
  'u32 + struct': cases['u32 + struct'],
  'bin.struct/bin.u32': cases['bin.struct/bin.u32'],
  'struct write': cases['struct write'],
  'unused schemas': { ...cases['unused schemas'], budget: 50 },
  'unused recursive': { ...cases['unused recursive'], budget: 50 },
};

const rolldownCases = {
  ...rollupCases,
  // Rolldown (as of 1.2.15) retains a pure call whose argument references the declared
  // variable and another namespace member (`bin.u32` here). Named imports aren't affected.
  'unused recursive': { ...cases['unused recursive'], budget: 2300 },
};

const withEntry = (code) => code.replace(`'tb'`, JSON.stringify(entry));

async function bundleEsbuild(code) {
  const result = await build({
    stdin: { contents: withEntry(code), loader: 'js', resolveDir: pkgDir },
    bundle: true,
    minify: true,
    format: 'esm',
    write: false,
    logLevel: 'silent',
  });
  return result.outputFiles[0].contents;
}

async function bundleRollup(code) {
  const bundle = await rollup({
    input: 'app',
    plugins: [
      {
        name: 'app',
        resolveId: (id) => (id === 'app' ? id : null),
        load: (id) => (id === 'app' ? withEntry(code) : null),
      },
    ],
  });
  const { output } = await bundle.generate({ format: 'esm' });
  await bundle.close();
  const minified = await transform(output[0].code, { minify: true, format: 'esm' });
  return new TextEncoder().encode(minified.code);
}

async function bundleRolldown(code) {
  const bundle = await rolldown({
    input: 'app',
    logLevel: 'silent',
    plugins: [
      {
        name: 'app',
        resolveId: (id) => (id === 'app' ? id : null),
        load: (id) => (id === 'app' ? withEntry(code) : null),
      },
    ],
  });
  const { output } = await bundle.generate({ format: 'esm', minify: true });
  await bundle.close();
  return new TextEncoder().encode(output[0].code);
}

let failed = false;

async function run(title, bundler, suite) {
  console.log(`\n${title}`);
  console.log('case'.padEnd(20), 'minified'.padStart(9), 'gzip'.padStart(7), 'budget'.padStart(7));
  for (const [name, { budget, code }] of Object.entries(suite)) {
    const bytes = await bundler(code);
    const over = bytes.length > budget;
    failed ||= over;
    console.log(
      name.padEnd(20),
      String(bytes.length).padStart(9),
      String(gzipSync(bytes, { level: 9 }).length).padStart(7),
      String(budget).padStart(7),
      over ? ' OVER BUDGET' : '',
    );
  }
}

await run('esbuild', bundleEsbuild, cases);
await run('rollup (minified with esbuild)', bundleRollup, rollupCases);
await run('rolldown', bundleRolldown, rolldownCases);

if (enforce && failed) {
  console.error('\nSome cases exceeded their size budget.');
  process.exit(1);
}
