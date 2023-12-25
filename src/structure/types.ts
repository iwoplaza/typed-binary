import { ISerialInput, ISerialOutput, IMeasurer } from '../io';

export type MaxValue = typeof MaxValue;
export const MaxValue = Symbol('The maximum value a schema can hold');

/**
 * A schema that hasn't been resolved yet (a reference).
 * Distinguishing between a "stable" schema, and an "unstable" schema
 * helps to avoid errors in usage of unresolved schemas (the lack of utility functions).
 */
export interface IUnstableSchema<I> {
  readonly _infered: I;
}

export interface ISchemaWithProperties<I extends { [key: string]: unknown }>
  extends IUnstableSchema<I> {
  readonly properties: StableSchemaMap<I>;
}

export interface ISchema<I> extends IUnstableSchema<I> {
  resolve(ctx: IRefResolver): void;
  write(output: ISerialOutput, value: I): void;
  read(input: ISerialInput): I;
  measure(value: I | typeof MaxValue, measurer?: IMeasurer): IMeasurer;
}

export abstract class Schema<I> implements ISchema<I> {
  readonly _infered!: I;

  abstract resolve(ctx: IRefResolver): void;
  abstract write(output: ISerialOutput, value: I): void;
  abstract read(input: ISerialInput): I;
  abstract measure(value: I | typeof MaxValue, measurer?: IMeasurer): IMeasurer;
}

export class Ref<K extends string> {
  constructor(public readonly key: K) {}
}

export class Keyed<K extends string, S extends IUnstableSchema<S['_infered']>> {
  constructor(public readonly key: K, public readonly innerType: S) {}
}

////
// Generic types
////

export enum SubTypeKey {
  STRING = 'STRING',
  ENUM = 'ENUM',
}

export interface IRefResolver {
  hasKey(key: string): boolean;

  resolve<T>(schemaOrRef: IUnstableSchema<T>): ISchema<T>;
  register<K extends string>(key: K, schema: ISchema<unknown>): void;
}

////
// Alias types
////

export type SchemaMap<T> = { [key in keyof T]: IUnstableSchema<T[key]> };
export type StableSchemaMap<T> = { [key in keyof T]: ISchema<T[key]> };
