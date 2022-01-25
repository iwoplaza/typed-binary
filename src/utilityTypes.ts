import { Schema } from './structure/types';

export type Parsed<T extends Schema<T['_infered']>> = OptionalUndefined<T['_infered']>;
export type ValueOrProvider<T> = T | (() => T);

type UndefinedKeys<T> = {
    [P in keyof T]: undefined extends T[P]  ? P: never
}[keyof T]

export type OptionalUndefined<T> = T extends object ? Partial<Pick<T, UndefinedKeys<T>>> & Omit<T, UndefinedKeys<T>> : T;
