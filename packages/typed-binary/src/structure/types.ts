import type { ByteCursor } from '../io/cursor.ts';

export type MaxValue = typeof MaxValue;
/** The biggest (in amount of bytes needed) value a schema can represent. */
export const MaxValue = /* @__PURE__ */ Symbol('MaxValue');

/**
 * @param TIn the JavaScript type accepted by the schema for parsing.
 * @param TOut the JavaScript type produced by the schema.
 */
export interface Schema<in TIn extends any = any, out TOut extends any = TIn> {
  write(cursor: ByteCursor, value: TIn): void;
  read(cursor: ByteCursor): TOut;
  /**
   * Returns the number of bytes `value` takes up when encoded. Given `MaxValue`, returns the
   * maximum number of bytes any value can take up, which is `NaN` if the schema is unbounded.
   */
  measure(value: TIn | MaxValue): number;
}

/**
 * Either a schema, or an object that defines itself as one by holding
 * a schema under the `'~typed-binary'` key. Accepted wherever a schema is expected.
 */
export type WithSchema<TIn = any, TOut = any> =
  | Schema<TIn, TOut>
  | { readonly ['~typed-binary']: { readonly schema: Schema<TIn, TOut> } };

/**
 * The schema behind a `WithSchema` value.
 */
export type UnwrapSchema<T> = T extends {
  readonly ['~typed-binary']: { readonly schema: infer TSchema };
}
  ? TSchema
  : T;

export function isSchemaLike(value: unknown): value is Schema {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as any).write === 'function' &&
    typeof (value as any).read === 'function' &&
    typeof (value as any).measure === 'function'
  );
}

export function toSchema(value: unknown): Schema | undefined {
  if (isSchemaLike(value)) {
    return value;
  }

  const meta = (value as Extract<WithSchema, { ['~typed-binary']: any }>)?.['~typed-binary'];
  if (meta && isSchemaLike(meta.schema)) {
    return meta.schema;
  }

  return undefined;
}

export type ExtractIn<T> = T extends WithSchema<infer TIn, infer _TOut> ? TIn : never;
export type ExtractOut<T> = T extends WithSchema<infer _TIn, infer TOut> ? TOut : never;
export type ExtractInRecord<T> =
  T extends Record<string | symbol | number, any> ? { [K in keyof T]: ExtractIn<T[K]> } : never;
export type ExtractOutRecord<T> =
  T extends Record<string | symbol | number, any> ? { [K in keyof T]: ExtractOut<T[K]> } : never;
