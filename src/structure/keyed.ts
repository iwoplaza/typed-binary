import { Parsed } from '..';
import { TypedBinaryError } from '../error';
import { ISerialInput, ISerialOutput } from '../io';
import { IRefResolver, ISchema, IStableSchema, Keyed, Ref } from './types';

class RefSchema<K extends string> implements IStableSchema<Ref<K>> {
    public readonly _infered!: Ref<K>;
    public readonly ref: Ref<K>;

    constructor(key: K) {
        this.ref = new Ref(key);
    }

    resolve(): void {
        throw new TypedBinaryError(`Tried to resolve a reference directly. Do it through a RefResolver instead.`);
    }

    read(): Ref<K> {
        throw new TypedBinaryError(`Tried to read a reference directly. Resolve it instead.`);
    }

    write(): void {
        throw new TypedBinaryError(`Tried to write a reference directly. Resolve it instead.`);
    }

    sizeOf(): number {
        throw new TypedBinaryError(`Tried to estimate size of a reference directly. Resolve it instead.`);
    }
}

class RefResolve implements IRefResolver {
    private registry: {[key: string]: IStableSchema<unknown>} = {};

    hasKey(key: string): boolean {
        return this.registry[key] !== undefined;
    }

    register<K extends string>(key: K, schema: IStableSchema<unknown>): void {
        this.registry[key] = schema;
    }

    resolve<T>(unstableSchema: ISchema<T>): IStableSchema<T> {
        if (unstableSchema instanceof RefSchema) {
            const ref = unstableSchema.ref;
            const key = ref.key as string;
            if (this.registry[key] !== undefined) {
                return this.registry[key] as IStableSchema<T>;
            }

            throw new TypedBinaryError(`Couldn't resolve reference to ${key}. Unknown key.`);
        }

        // Since it's not a RefSchema, we assume it can be resolved.
        (unstableSchema as IStableSchema<T>).resolve(this);

        return unstableSchema as IStableSchema<T>;
    }
}

export class KeyedSchema<K extends string, S extends IStableSchema<unknown>> implements ISchema<Keyed<K, S>> {
    public readonly _infered!: Keyed<K, S>;
    public innerType: S;

    constructor(public readonly key: K, innerResolver: (ref: ISchema<Ref<K>>) => S) {
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

    sizeOf(value: Parsed<S>): number {
        return this.innerType.sizeOf(value);
    }
}

