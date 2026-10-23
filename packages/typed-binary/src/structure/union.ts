import { hasProcess } from '../env.ts';
import { InvalidSchemaShapeError, ValidationError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import { measureMax } from './measureMax.ts';
import { struct, type Struct } from './struct.ts';
import {
  type ExtractIn,
  type ExtractOut,
  MaxValue,
  type Schema,
  toSchema,
  type UnwrapSchema,
  type WithSchema,
} from './types.ts';

/**
 * A variant can be described either by a struct (or an object holding one, see `WithSchema`),
 * or by a record of its properties. Properties can be getters, to reference schemas recursively.
 */
export type UnionVariant =
  | Struct
  | { readonly ['~typed-binary']: { readonly schema: Struct } }
  | { readonly [key: string]: WithSchema };

type VariantProps<T> = UnwrapSchema<T> extends Struct<infer TProps> ? TProps : T;

// Single mapped types (instead of intersections) keep property types lazy,
// which is required for properties that recursively reference the union.
type VariantIn<TKey extends string, TTag, TBase, TProps> = {
  readonly [K in TKey | keyof TBase | keyof TProps]: K extends TKey
    ? TTag
    : K extends keyof TProps
      ? ExtractIn<TProps[K]>
      : K extends keyof TBase
        ? ExtractIn<TBase[K]>
        : never;
};

type VariantOut<TKey extends string, TTag, TBase, TProps> = {
  [K in TKey | keyof TBase | keyof TProps]: K extends TKey
    ? TTag
    : K extends keyof TProps
      ? ExtractOut<TProps[K]>
      : K extends keyof TBase
        ? ExtractOut<TBase[K]>
        : never;
};

type UnionIn<TKey extends string, TBase, TVariants> = {
  [TTag in keyof TVariants]: VariantIn<TKey, TTag, TBase, VariantProps<TVariants[TTag]>>;
}[keyof TVariants];

type UnionOut<TKey extends string, TBase, TVariants> = {
  [TTag in keyof TVariants]: VariantOut<TKey, TTag, TBase, VariantProps<TVariants[TTag]>>;
}[keyof TVariants];

export interface UnionOptions<TKey extends string, TBase> {
  /**
   * The property that holds the tag of the variant.
   * @default 'type'
   */
  readonly key?: TKey;
  /**
   * Properties shared by all variants, encoded after the tag and before the variant's own properties.
   */
  readonly base?: TBase;
}

export interface Union<
  TTag = Schema,
  TVariants = Record<string, UnionVariant>,
  TKey extends string = 'type',
  TBase = {},
> extends Schema<UnionIn<TKey, TBase, TVariants>, UnionOut<TKey, TBase, TVariants>> {
  readonly tag: UnwrapSchema<TTag>;
  readonly variants: TVariants;
  readonly key: TKey;
  readonly base: Struct<TBase & Record<string, WithSchema>> | undefined;

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue)`
   */
  readonly maxSize: number;
}

class UnionImpl<TTag, TVariants, TKey extends string, TBase> implements Union<
  TTag,
  TVariants,
  TKey,
  TBase
> {
  readonly tag: UnwrapSchema<TTag>;
  readonly variants: TVariants;
  readonly key: TKey;
  readonly base: Struct<TBase & Record<string, WithSchema>> | undefined;
  readonly #tag: Schema;
  readonly #base: Schema<Record<string, unknown>> | undefined;
  readonly #variantSchemas: Map<string, Schema>;

  constructor(tag: Schema, variants: TVariants, key: TKey, base: TBase | undefined) {
    this.tag = tag as UnwrapSchema<TTag>;
    this.variants = variants;
    this.key = key;
    this.base = base ? struct(base as TBase & Record<string, WithSchema>) : undefined;
    this.#tag = tag;
    this.#base = this.base;
    this.#variantSchemas = new Map(
      Object.entries(variants as Record<string, UnionVariant>).map(([tagValue, variant]) => [
        tagValue,
        toSchema(variant) ?? struct(variant as Record<string, WithSchema>),
      ]),
    );
  }

  #getVariant(tagValue: unknown): Schema {
    // Object keys are always strings, while tags can also be numbers
    const variant = this.#variantSchemas.get(String(tagValue));
    if (!variant) {
      throw new ValidationError(
        `Unknown variant '${String(tagValue)}', expected one of ${JSON.stringify([
          ...this.#variantSchemas.keys(),
        ])}`,
      );
    }
    return variant;
  }

  write(cursor: ByteCursor, value: UnionIn<TKey, TBase, TVariants>): void {
    const tagValue = (value as Record<string, unknown>)[this.key];
    const variant = this.#getVariant(tagValue);

    this.#tag.write(cursor, tagValue);
    this.#base?.write(cursor, value);
    variant.write(cursor, value);
  }

  read(cursor: ByteCursor): UnionOut<TKey, TBase, TVariants> {
    const tagValue = this.#tag.read(cursor);
    const variant = this.#getVariant(tagValue);

    return {
      [this.key]: tagValue,
      ...this.#base?.read(cursor),
      ...variant.read(cursor),
    } as UnionOut<TKey, TBase, TVariants>;
  }

  get maxSize(): number {
    return this.measure(MaxValue);
  }

  measure(value: UnionIn<TKey, TBase, TVariants> | MaxValue): number {
    if (value !== MaxValue) {
      const tagValue = (value as Record<string, unknown>)[this.key];
      const variant = this.#getVariant(tagValue);

      return (
        this.#tag.measure(tagValue) + (this.#base?.measure(value) ?? 0) + variant.measure(value)
      );
    }

    // Variants can reference this union recursively
    return measureMax(this, () => {
      // Measuring each variant together with its tag, as the size of the tag
      // can depend on its value (e.g. for `bin.prefixEnum` or `bin.string`).
      let biggest = 0;
      for (const [tagValue, variant] of this.#variantSchemas) {
        // An unbounded (NaN) variant makes the union unbounded, as `Math.max` returns NaN
        biggest = Math.max(biggest, this.#tag.measure(tagValue) + variant.measure(MaxValue));
      }

      return (this.#base?.measure(MaxValue) ?? 0) + biggest;
    });
  }
}

/**
 * A tagged union. The `tag` is encoded first, then the `base` properties (if any),
 * then the properties of the variant the tag points to.
 *
 * @example
 * const Shape = bin.union(bin.orderedEnum('circle', 'rect'), {
 *   circle: { radius: bin.f32 },
 *   rect: { width: bin.f32, height: bin.f32 },
 * });
 * // { type: 'circle', radius: number } | { type: 'rect', width: number, height: number }
 *
 * @param tag Schema of the tag, e.g. `bin.orderedEnum(...)`, `bin.u8` or `bin.string`.
 * @param variants The properties of each variant, keyed by the value of the tag.
 */
/*#__NO_SIDE_EFFECTS__*/
export function union<
  TTag,
  // Not constrained to `UnionVariant`, as checking against it would eagerly evaluate
  // the types of getters, breaking recursive references.
  TVariants extends { readonly [K in ExtractOut<TTag> & PropertyKey]: any },
  TKey extends string = 'type',
  TBase extends { readonly [key: string]: any } = {},
>(
  tag: TTag,
  variants: TVariants,
  options?: UnionOptions<TKey, TBase>,
): Union<TTag, TVariants, TKey, TBase> {
  const tagSchema = toSchema(tag) as Schema;
  if (hasProcess && process.env.NODE_ENV !== 'production' && !tagSchema) {
    throw new InvalidSchemaShapeError(
      `bin.union(...) expects a schema as the tag, got '${String(tag)}'`,
    );
  }

  return new UnionImpl<TTag, TVariants, TKey, TBase>(
    tagSchema,
    variants,
    options?.key ?? ('type' as TKey),
    options?.base,
  );
}
