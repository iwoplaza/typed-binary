import { ISchema } from './structure/types';

export type Parsed<T> = T extends ISchema<infer I> ? I : never;
export type ParsedConcrete<B, T, ConcreteType extends string> = B & Parsed<T> & { type: ConcreteType };
export type ValueOrProvider<T> = T | (() => T);

type UndefinedKeys<T> = {
    [P in keyof T]: undefined extends T[P]  ? P: never
}[keyof T]

export type OptionalUndefined<T> = Partial<Pick<T, UndefinedKeys<T>>> & Omit<T, UndefinedKeys<T>>;
