import { Schema } from './structure/types';

export type Parsed<T extends Schema<T['_infered']>> = T['_infered'];
export type ValueOrProvider<T> = T | (() => T);