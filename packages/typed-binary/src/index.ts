// Only named exports, which every bundler can tree-shake, also when accessed through
// a namespace import (`import * as bin from 'typed-binary'`).
export * from './main-api.ts';
export { getSystemEndianness } from './util.ts';
