import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';

export type MaxValue = typeof MaxValue;
export const MaxValue = Symbol(
  'The biggest (in amount of bytes needed) value a schema can represent',
);

// export interface ISchemaWithProperties<TProps extends Record<string, AnySchema>> extends ISchema<
//   UnwrapRecord<TProps>
// > {
//   readonly properties: TProps;
// }

// export type AnySchemaWithProperties = ISchemaWithProperties<Record<string, AnySchema>>;

// export type PropertiesOf<T extends AnySchemaWithProperties> = T['properties'];

export type PropertyDescription = {
  bufferOffset: number;
  schema: Schema;
};

/**
 * @param TIn the JavaScript type accepted by the schema for parsing.
 * @param TOut the JavaScript type produced by the schema.
 */
export interface Schema<in TIn extends any = any, out TOut extends any = TIn> {
  write(output: ISerialOutput, value: TIn): void;
  read(input: ISerialInput): TOut;
  measure(value: TIn | MaxValue, measurer?: IMeasurer): IMeasurer;
}

export type WithSchema<TIn = any, TOut = any> =
  | Schema<TIn, TOut>
  | { readonly ['~typed-binary']: { props: Schema<TIn, TOut> } };

////
// Generic types
////

export type SubTypeKey = 'string' | 'enum';
export const SubTypeKey = {
  STRING: 'string',
  ENUM: 'enum',
} as const;

export type ExtractIn<T> = T extends WithSchema<infer TIn, infer _TOut> ? TIn : never;
export type ExtractOut<T> = T extends WithSchema<infer _TIn, infer TOut> ? TOut : never;
export type ExtractInRecord<T> =
  T extends Record<string | symbol | number, any> ? { [K in keyof T]: ExtractIn<T[K]> } : never;
export type ExtractOutRecord<T> =
  T extends Record<string | symbol | number, any> ? { [K in keyof T]: ExtractOut<T[K]> } : never;
