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
  [K in DistributedKeyOf<T[number]>]: Extract<T[number], { [key in K]: unknown }>[K];
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

export type MutableRecord<T extends Record<string | number | symbol, unknown>> = {
  -readonly [K in keyof T]: T[K];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
