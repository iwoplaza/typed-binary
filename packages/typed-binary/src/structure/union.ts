import { InvalidSchemaShapeError, ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { SerialInput, SerialOutput } from '../io/types.ts';
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
   * Alias for `.measure(MaxValue).size`
   */
  readonly maxSize: number;
}

class UnionImpl implements Schema<Record<string, unknown>> {
  readonly tag: Schema;
  readonly variants: Record<string, UnionVariant>;
  readonly key: string;
  readonly base: Struct | undefined;
  readonly #variantSchemas: Map<string, Schema>;

  constructor(
    tag: Schema,
    variants: Record<string, UnionVariant>,
    key: string,
    base: Record<string, WithSchema> | undefined,
  ) {
    this.tag = tag;
    this.variants = variants;
    this.key = key;
    this.base = base ? struct(base) : undefined;
    this.#variantSchemas = new Map(
      Object.entries(variants).map(([tagValue, variant]) => [
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

  write(output: SerialOutput, value: Record<string, unknown>): void {
    const tagValue = value[this.key];
    const variant = this.#getVariant(tagValue);

    this.tag.write(output, tagValue);
    this.base?.write(output, value);
    variant.write(output, value);
  }

  read(input: SerialInput): Record<string, unknown> {
    const tagValue = this.tag.read(input);
    const variant = this.#getVariant(tagValue);

    return {
      [this.key]: tagValue,
      ...this.base?.read(input),
      ...variant.read(input),
    };
  }

  get maxSize(): number {
    return this.measure(MaxValue).size;
  }

  measure(
    value: Record<string, unknown> | MaxValue,
    measurer: Measurer = new Measurer(),
  ): Measurer {
    if (value !== MaxValue) {
      const tagValue = value[this.key];
      const variant = this.#getVariant(tagValue);

      this.tag.measure(tagValue, measurer);
      this.base?.measure(value, measurer);
      return variant.measure(value, measurer);
    }

    // Variants can reference this union recursively
    return measureMax(this, measurer, () => {
      this.base?.measure(MaxValue, measurer);

      // Measuring each variant together with its tag, as the size of the tag
      // can depend on its value (e.g. for `bin.prefixEnum` or `bin.string`).
      let biggest: [string, Schema] | undefined;
      let biggestSize = -1;
      for (const [tagValue, variant] of this.#variantSchemas) {
        const forked = measurer.fork();
        this.tag.measure(tagValue, forked);
        variant.measure(MaxValue, forked);
        // An unbounded (NaN) variant is the biggest one
        if (Number.isNaN(forked.size) || forked.size > biggestSize) {
          biggest = [tagValue, variant];
          biggestSize = forked.size;
          if (Number.isNaN(biggestSize)) {
            break;
          }
        }
      }

      if (biggest) {
        // Measuring for real this time
        this.tag.measure(biggest[0], measurer);
        biggest[1].measure(MaxValue, measurer);
      }
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
  const tagSchema = toSchema(tag);
  if (!tagSchema) {
    throw new InvalidSchemaShapeError(
      `bin.union(...) expects a schema as the tag, got '${String(tag)}'`,
    );
  }

  return new UnionImpl(
    tagSchema,
    variants as Record<string, UnionVariant>,
    options?.key ?? 'type',
    options?.base,
  ) as unknown as Union<TTag, TVariants, TKey, TBase>;
}
