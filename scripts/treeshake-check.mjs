// Bundles small apps that each import a few typed-binary exports, and prints how much
// of the library ends up in them. Run after building:
//   `node scripts/treeshake-check.mjs [packageDir] [--check]`
// With `--check`, exits with a non-zero code if any case exceeds its budget.
import { build, transform } from 'esbuild';
import { resolve } from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';
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
    code: `import { Measurer } from 'tb'; globalThis.x = 1;`,
  },
  getSystemEndianness: {
    budget: 200,
    code: `import { getSystemEndianness } from 'tb'; globalThis.x = getSystemEndianness;`,
  },
  Measurer: {
    budget: 600,
    code: `import { Measurer } from 'tb'; globalThis.x = Measurer;`,
  },
  cursor: {
    budget: 550,
    code: `import { cursor } from 'tb'; globalThis.x = cursor;`,
  },
  'TypeGPU set': {
    budget: 800,
    code: `import { cursor, getSystemEndianness, Measurer } from 'tb';
    globalThis.x = [cursor, getSystemEndianness, Measurer];`,
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
  // Using the namespace as a value (instead of accessing its members) retains the whole library.
  'whole namespace': {
    budget: 16000,
    code: `import * as bin from 'tb'; globalThis.x = bin;`,
  },
};

const rollupCases = {
  'u32 + struct': cases['u32 + struct'],
  'bin.struct/bin.u32': cases['bin.struct/bin.u32'],
  'struct write': cases['struct write'],
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

if (enforce && failed) {
  console.error('\nSome cases exceeded their size budget.');
  process.exit(1);
}
