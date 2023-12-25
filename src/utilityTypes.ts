import { IUnstableSchema, Keyed, Ref } from './structure/types';

export type Parsed<
  T,
  M extends { [key in keyof M]: M[key] } = Record<string, never>,
> = T extends Keyed<infer TypeKey, infer Inner>
  ? Parsed<Inner, M & { [key in TypeKey]: T['innerType'] }>
  : T extends Ref<infer K>
  ? K extends keyof M
    ? Parsed<M[K], M>
    : never
  : T extends IUnstableSchema<infer I>
  ? Parsed<I, M>
  : T extends Record<string, unknown>
  ? { [K in keyof T]: Parsed<T[K], M> }
  : T extends (infer E)[]
  ? Parsed<E>[]
  : T;

export type ValueOrProvider<T> = T | (() => T);

type UndefinedKeys<T> = {
  [P in keyof T]: undefined extends T[P] ? P : never;
}[keyof T];

export type OptionalUndefined<T> = Partial<Pick<T, UndefinedKeys<T>>> &
  Omit<T, UndefinedKeys<T>>;

export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends Record<string, never> & infer O // Getting rid of Record<string, never>-s, which represent empty objects.
  ? O
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends Record<string, never> & infer O // Getting rid of Record<string, never>-s, which represent empty objects.
  ? ExpandRecursively<O>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;
