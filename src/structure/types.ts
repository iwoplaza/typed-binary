import type { ISerialInput, ISerialOutput, IMeasurer } from '../io';
import type { Parsed } from '../utilityTypes';

export type MaxValue = typeof MaxValue;
export const MaxValue = Symbol(
  'The biggest (in amount of bytes needed) value a schema can represent',
);

export type UnwrapOf<T> = T extends AnySchema ? T['__unwrapped'] : never;
export type KeyDefinitionOf<T> = T extends AnySchema
  ? T['__keyDefinition']
  : never;

export interface ISchemaWithProperties<
  TUnwrap extends Record<string, AnySchema>,
> extends ISchema<TUnwrap> {
  readonly properties: TUnwrap;
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
export interface ISchema<TUnwrap, TKeyDef extends string = string> {
  readonly __unwrapped: TUnwrap;
  readonly __keyDefinition: TKeyDef;
  resolve(ctx: IRefResolver): void;
  write(output: ISerialOutput, value: Parsed<TUnwrap>): void;
  read(input: ISerialInput): Parsed<TUnwrap>;
  measure(value: Parsed<TUnwrap> | MaxValue, measurer?: IMeasurer): IMeasurer;
  seekProperty(
    reference: Parsed<TUnwrap> | MaxValue,
    prop: keyof TUnwrap,
  ): PropertyDescription | null;
}

export type AnySchema = ISchema<unknown>;

export abstract class Schema<TUnwrap> implements ISchema<TUnwrap, never> {
  readonly __unwrapped!: TUnwrap;
  readonly __keyDefinition!: never;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(ctx: IRefResolver): void {
    // override this if you need to resolve internal references.
  }
  abstract write(output: ISerialOutput, value: Parsed<TUnwrap>): void;
  abstract read(input: ISerialInput): Parsed<TUnwrap>;
  abstract measure(
    value: Parsed<TUnwrap> | MaxValue,
    measurer?: IMeasurer,
  ): IMeasurer;
  seekProperty(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _reference: Parsed<TUnwrap> | MaxValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _prop: keyof TUnwrap,
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
  register<K extends string>(key: K, schema: ISchema<unknown, K>): void;
}

////
// Alias types
////
