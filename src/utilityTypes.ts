import {
  IKeyedSchema,
  ISchema,
  Ref,
  Unwrap,
  UnwrapRecord,
} from './structure/types';

/**
 * @example ```
 * type ObjectUnion = ({ a: number, b: number } | { a: number, c: number });
 *
 * keyof ObjectUnion -> 'a'
 * DistributedKeyOf<ObjectUnion> -> 'a' | 'b' | 'c'
 * ```
 */
export type DistributedKeyOf<T> = T extends unknown ? keyof T : never;

/**
 * @example ```
 * type ObjectArray = [{ a: number, b: number }, { a: number, c: number }];
 *
 * MergeRecords<ObjectArray> -> { a: number, b: number, c: number }
 * ```
 */
export type MergeRecords<T extends unknown[]> = {
  [K in DistributedKeyOf<T[number]>]: Extract<
    T[number],
    { [key in K]: unknown }
  >[K];
};

/**
 * @example ```
 * type ObjectUnion = { a: number, b: number } | { a: number, c: number };
 *
 * MergeRecordUnion<ObjectUnion> -> { a: number, b: number, c: number }
 * ```
 */
export type MergeRecordUnion<T> = {
  [K in DistributedKeyOf<T>]: Extract<T, { [key in K]: unknown }>[K];
};

export type Parsed<
  T,
  /** type key dictionary, gets populated during recursive parsing */
  TKeyDict extends { [key in keyof TKeyDict]: TKeyDict[key] } = Record<
    string,
    never
  >,
> = T extends IKeyedSchema<infer TKeyDefinition, infer TUnwrapped>
  ? // A schema that defines themselves under a key in the dictionary
    Parsed<TUnwrapped, TKeyDict & { [key in TKeyDefinition]: Unwrap<T> }>
  : T extends ISchema<infer TUnwrapped>
  ? // A non-keyed schema
    Parsed<TUnwrapped, TKeyDict>
  : // A reference to a keyed schema
  T extends Ref<infer K>
  ? K extends keyof TKeyDict
    ? Parsed<TKeyDict[K], TKeyDict>
    : never
  : T extends Record<string, unknown>
  ? { [K in keyof T]: Parsed<T[K], TKeyDict> }
  : T extends unknown[]
  ? { [K in keyof T]: Parsed<T[K], TKeyDict> }
  : T;

export type ParseUnwrapped<T> = Parsed<Unwrap<T>>;

export type ParseUnwrappedRecord<T> = Parsed<UnwrapRecord<T>>;
