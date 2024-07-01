import type { ISerialInput, ISerialOutput, IMeasurer } from '../io';
import type { Parsed } from '../utilityTypes';

export type MaxValue = typeof MaxValue;
export const MaxValue = Symbol(
  'The biggest (in amount of bytes needed) value a schema can represent',
);

export interface IKeyedSchema<TKeyDef extends string, TUnwrapped>
  extends ISchema<TUnwrapped> {
  readonly __keyDefinition: TKeyDef;
}

export type AnyKeyedSchema = IKeyedSchema<string, unknown>;

/**
 * Removes one layer of schema wrapping.
 *
 * @example ```
 * Unwrap<ISchema<ISchema<number>>> -> ISchema<number>
 * Unwrap<ISchema<number>> -> number
 * ```
 *
 * Keyed schemas are bypassed.
 *
 * @example ```
 * Unwrap<IKeyedSchema<'abc', ISchema<number>>> -> IKeyedSchema<'abc', number>
 * ```
 */
export type Unwrap<T> = T extends IKeyedSchema<infer TKeyDef, infer TInner>
  ? // bypassing keyed schemas, as that information has to be preserved for parsing
    IKeyedSchema<TKeyDef, Unwrap<TInner>>
  : T extends ISchema<infer TInner>
  ? TInner
  : T;

/**
 * Removes one layer of schema wrapping of record properties.
 *
 * @example ```
 * Unwrap<{
 *   a: ISchema<number>,
 *   b: ISchema<ISchema<string>>
 * }>
 * // <=>
 * {
 *   a: number,
 *   b: ISchema<string>
 * }
 * ```
 */
export type UnwrapRecord<T> = T extends IKeyedSchema<
  infer TKeyDef,
  Record<infer K, unknown>
>
  ? IKeyedSchema<TKeyDef, { [key in K]: Unwrap<T['__unwrapped'][key]> }>
  : T extends Record<infer K, unknown>
  ? { [key in K]: Unwrap<T[key]> }
  : T;

/* helper type for UnwrapArray */
type __UnwrapArray<T> = T extends unknown[]
  ? {
      [key in keyof T]: Unwrap<T[key]>;
    }
  : never;

/**
 * Removes one layer of schema wrapping of array elements.
 *
 * @example ```
 * Unwrap<[a: ISchema<number>, b: ISchema<ISchema<string>>]>
 * // <=>
 * [a: number, b: ISchema<string>]
 * ```
 */
export type UnwrapArray<T> = T extends IKeyedSchema<infer TKeyDef, unknown[]>
  ? IKeyedSchema<TKeyDef, __UnwrapArray<T['__unwrapped']>>
  : T extends unknown[]
  ? __UnwrapArray<T>
  : T;

export interface ISchemaWithProperties<TProps extends Record<string, AnySchema>>
  extends ISchema<UnwrapRecord<TProps>> {
  readonly properties: TProps;
}

export type AnySchemaWithProperties = ISchemaWithProperties<
  Record<string, AnySchema>
>;

export type PropertyDescription = {
  bufferOffset: number;
  schema: ISchema<unknown>;
};

/**
 * @param TUnwrap one level of unwrapping to the inferred type.
 */
export interface ISchema<TUnwrapped> {
  readonly __unwrapped: TUnwrapped;

  resolveReferences(ctx: IRefResolver): void;
  write(output: ISerialOutput, value: Parsed<TUnwrapped>): void;
  read(input: ISerialInput): Parsed<TUnwrapped>;
  measure(
    value: Parsed<TUnwrapped> | MaxValue,
    measurer?: IMeasurer,
  ): IMeasurer;
  seekProperty(
    reference: Parsed<TUnwrapped> | MaxValue,
    prop: keyof TUnwrapped,
  ): PropertyDescription | null;
}

export type AnySchema = ISchema<unknown>;

export abstract class Schema<TUnwrapped> implements ISchema<TUnwrapped> {
  readonly __unwrapped!: TUnwrapped;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolveReferences(ctx: IRefResolver): void {
    // override this if you need to resolve internal references.
  }
  abstract write(output: ISerialOutput, value: Parsed<TUnwrapped>): void;
  abstract read(input: ISerialInput): Parsed<TUnwrapped>;
  abstract measure(
    value: Parsed<TUnwrapped> | MaxValue,
    measurer?: IMeasurer,
  ): IMeasurer;
  seekProperty(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _reference: Parsed<TUnwrapped> | MaxValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _prop: keyof TUnwrapped,
  ): PropertyDescription | null {
    // override this if necessary.
    return null;
  }
}

export class Ref<K extends string> {
  constructor(public readonly key: K) {}
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

  resolve<TSchema extends AnySchema>(schemaOrRef: TSchema): TSchema;
  register<K extends string>(key: K, schema: ISchema<unknown>): void;
}

////
// Alias types
////
