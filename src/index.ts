export * from './structure';
export * from './describe';
export * from './io';

import type { ExpandRecursively, Parsed as ParsedRaw } from './utilityTypes';

export type Parsed<T, M extends {[key in keyof M]: M[key]} = Record<string, never>> = ExpandRecursively<ParsedRaw<T, M>>;
