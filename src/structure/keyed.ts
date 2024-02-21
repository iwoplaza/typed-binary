import { UnresolvedReferenceError } from '../error';
import { IMeasurer, ISerialInput, ISerialOutput, Measurer } from '../io';
import { ParseUnwrapped, Parsed } from '../utilityTypes';
import {
  IRefResolver,
  ISchema,
  Ref,
  MaxValue,
  PropertyDescription,
  AnySchema,
  Unwrap,
  IKeyedSchema,
} from './types';

class RefSchema<TKeyDef extends string> implements ISchema<Ref<TKeyDef>> {
  public readonly __unwrapped!: Ref<TKeyDef>;
  public readonly ref: Ref<TKeyDef>;

  constructor(key: TKeyDef) {
    this.ref = new Ref(key);
  }

  resolve(): void {
    throw new UnresolvedReferenceError(
      `Tried to resolve a reference directly. Do it through a RefResolver instead.`,
    );
  }

  read(): Parsed<Ref<TKeyDef>> {
    throw new UnresolvedReferenceError(
      `Tried to read a reference directly. Resolve it instead.`,
    );
  }

  write(): void {
    throw new UnresolvedReferenceError(
      `Tried to write a reference directly. Resolve it instead.`,
    );
  }

  measure(): IMeasurer {
    throw new UnresolvedReferenceError(
      `Tried to measure size of a reference directly. Resolve it instead.`,
    );
  }

  seekProperty(): PropertyDescription | null {
    throw new UnresolvedReferenceError(
      `Tried to seek property of a reference directly. Resolve it instead.`,
    );
  }
}

class RefResolve implements IRefResolver {
  private registry: { [key: string]: ISchema<unknown> } = {};

  hasKey(key: string): boolean {
    return this.registry[key] !== undefined;
  }

  register<K extends string>(key: K, schema: ISchema<unknown>): void {
    this.registry[key] = schema;
  }

  resolve<TSchema extends AnySchema>(unstableSchema: TSchema): TSchema {
    if (unstableSchema instanceof RefSchema) {
      const ref = unstableSchema.ref;
      const key = ref.key as string;
      if (this.registry[key] !== undefined) {
        return this.registry[key] as TSchema;
      }

      throw new UnresolvedReferenceError(
        `Couldn't resolve reference to ${key}. Unknown key.`,
      );
    }

    // Since it's not a RefSchema, we assume it can be resolved.
    unstableSchema.resolve(this);

    return unstableSchema;
  }
}

export class KeyedSchema<
  TInner extends ISchema<unknown>,
  TKeyDef extends string,
> implements IKeyedSchema<TKeyDef, Unwrap<TInner>>
{
  public readonly __unwrapped!: Unwrap<TInner>;
  public readonly __keyDefinition!: TKeyDef;
  public innerType: TInner;

  constructor(
    public readonly key: TKeyDef,
    innerResolver: (ref: ISchema<Ref<TKeyDef>>) => TInner,
  ) {
    this.innerType = innerResolver(new RefSchema(key));

    // Automatically resolving after keyed creation.
    this.resolve(new RefResolve());
  }

  resolve(ctx: IRefResolver): void {
    if (!ctx.hasKey(this.key)) {
      ctx.register(this.key, this.innerType);

      this.innerType.resolve(ctx);
    }
  }

  read(input: ISerialInput): ParseUnwrapped<TInner> {
    return this.innerType.read(input) as ParseUnwrapped<TInner>;
  }

  write(output: ISerialOutput, value: ParseUnwrapped<TInner>): void {
    this.innerType.write(output, value);
  }

  measure(
    value: ParseUnwrapped<TInner> | typeof MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return this.innerType.measure(value, measurer);
  }

  seekProperty(
    reference: ParseUnwrapped<TInner> | typeof MaxValue,
    prop: keyof Unwrap<TInner>,
  ): PropertyDescription | null {
    return this.innerType.seekProperty(reference, prop as never);
  }
}
