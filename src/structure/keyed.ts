import { Parsed } from '..';
import { TypedBinaryError } from '../error';
import { IMeasurer, ISerialInput, ISerialOutput, Measurer } from '../io';
import {
  IRefResolver,
  IUnstableSchema,
  ISchema,
  Keyed,
  Ref,
  MaxValue,
} from './types';

class RefSchema<K extends string> implements ISchema<Ref<K>> {
  public readonly _infered!: Ref<K>;
  public readonly ref: Ref<K>;

  constructor(key: K) {
    this.ref = new Ref(key);
  }

  resolve(): void {
    throw new TypedBinaryError(
      `Tried to resolve a reference directly. Do it through a RefResolver instead.`,
    );
  }

  read(): Ref<K> {
    throw new TypedBinaryError(
      `Tried to read a reference directly. Resolve it instead.`,
    );
  }

  write(): void {
    throw new TypedBinaryError(
      `Tried to write a reference directly. Resolve it instead.`,
    );
  }

  measure(): IMeasurer {
    throw new TypedBinaryError(
      `Tried to measure size of a reference directly. Resolve it instead.`,
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

  resolve<T>(unstableSchema: IUnstableSchema<T>): ISchema<T> {
    if (unstableSchema instanceof RefSchema) {
      const ref = unstableSchema.ref;
      const key = ref.key as string;
      if (this.registry[key] !== undefined) {
        return this.registry[key] as ISchema<T>;
      }

      throw new TypedBinaryError(
        `Couldn't resolve reference to ${key}. Unknown key.`,
      );
    }

    // Since it's not a RefSchema, we assume it can be resolved.
    (unstableSchema as ISchema<T>).resolve(this);

    return unstableSchema as ISchema<T>;
  }
}

export class KeyedSchema<K extends string, S extends ISchema<unknown>>
  implements IUnstableSchema<Keyed<K, S>>
{
  public readonly _infered!: Keyed<K, S>;
  public innerType: S;

  constructor(
    public readonly key: K,
    innerResolver: (ref: IUnstableSchema<Ref<K>>) => S,
  ) {
    this.innerType = innerResolver(new RefSchema(key));
    this._infered = new Keyed(key, this.innerType);

    // Automatically resolving after keyed creation.
    this.resolve(new RefResolve());
  }

  resolve(ctx: IRefResolver): void {
    if (!ctx.hasKey(this.key)) {
      ctx.register(this.key, this.innerType);

      this.innerType.resolve(ctx);
    }
  }

  read(input: ISerialInput): Parsed<S> {
    return this.innerType.read(input) as Parsed<S>;
  }

  write(output: ISerialOutput, value: Parsed<S>): void {
    this.innerType.write(output, value);
  }

  measure(
    value: Parsed<S> | typeof MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    return this.innerType.measure(value, measurer);
  }
}
