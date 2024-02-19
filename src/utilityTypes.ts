import { ISchema, Ref, UnwrapOf } from './structure/types';

/**
 * @example ```
 * type ObjectUnion = ({ a: number, b: number } | { a: number, c: number });
 *
 * keyof ObjectUnion -> 'a'
 * DistributedKeyOf<ObjectUnion> -> 'a' | 'b' | 'c'
 * ```
 */
export type DistributedKeyOf<T> = T extends any ? keyof T : never;

/**
 * @example ```
 * type ObjectArray = [{ a: number, b: number }, { a: number, c: number }];
 *
 * MergeRecords<ObjectArray> -> { a: number, b: number, c: number }
 * ```
 */
export type MergeRecords<T extends any[]> = {
  [K in DistributedKeyOf<T[number]>]: Filter<T[number], { [key in K]: any }>[K];
};

/**
 * @example ```
 * type ObjectUnion = { a: number, b: number } | { a: number, c: number };
 *
 * MergeRecordUnion<ObjectUnion> -> { a: number, b: number, c: number }
 * ```
 */
export type MergeRecordUnion<T> = {
  [K in DistributedKeyOf<T>]: Filter<T, { [key in K]: any }>[K];
};

// Remove types from T that are assignable to U
export type Diff<T, U> = T extends U ? never : T;
// Remove types from T that are not assignable to U
export type Filter<T, U> = T extends U ? T : never;

export type Parsed<
  T,
  /** type key dictionary */
  TKeyDict extends { [key in keyof TKeyDict]: TKeyDict[key] } = Record<
    string,
    never
  >,
> = T extends ISchema<infer TUnwrap, never>
  ? // A non-keyed schema
    Parsed<TUnwrap, TKeyDict>
  : T extends ISchema<infer TUnwrap, infer TKeyDefinition>
  ? // A schema that defines themselves under a key in the dictionary
    Parsed<TUnwrap, TKeyDict & { [key in TKeyDefinition]: T }>
  : // A reference to a keyed schema
  T extends Ref<infer K>
  ? K extends keyof TKeyDict
    ? Parsed<UnwrapOf<TKeyDict[K]>, TKeyDict>
    : never
  : // Compound types
  T extends Record<string, unknown>
  ? { [K in keyof T]: Parsed<T[K], TKeyDict> }
  : T extends (infer E)[]
  ? Parsed<E, TKeyDict>[]
  : T;
