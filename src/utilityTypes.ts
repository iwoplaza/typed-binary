import { ISchema, Keyed, Ref } from './structure/types';

export type Parsed<T, M extends {[key in keyof M]: M[key]} = Record<string, never>> =
    T extends Keyed<infer TypeKey, infer Inner> ?
        Parsed<Inner, M & {[key in TypeKey]: T['innerType']}> :
    T extends Ref<infer K> ?
        (K extends keyof M ? Parsed<M[K], M> : never) :
    T extends ISchema<infer I> ?
        Parsed<I, M> :
    T extends Record<string, unknown> ?
        {[K in keyof T]: Parsed<T[K], M>} :
    T;


export type ValueOrProvider<T> = T | (() => T);

type UndefinedKeys<T> = {
    [P in keyof T]: undefined extends T[P]  ? P: never
}[keyof T]

export type OptionalUndefined<T> = Partial<Pick<T, UndefinedKeys<T>>> & Omit<T, UndefinedKeys<T>>;
