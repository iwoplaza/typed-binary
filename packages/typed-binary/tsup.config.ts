import { defineConfig } from 'tsup';

// Only the CommonJS entry is bundled. The ES modules and type declarations
// are emitted by `tsc -p tsconfig.build.json`, one file per source module,
// which keeps them tree-shakeable.
export default defineConfig({
  entryPoints: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  tsconfig: './tsconfig.build.json',
  target: 'es2022',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
});
