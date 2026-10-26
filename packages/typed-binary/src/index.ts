// Only named exports, which every bundler can tree-shake, also when accessed through
// a namespace import (`import * as bin from 'typed-binary'`).
export { array, type Array } from './structure/array.ts';
export {
  bool,
  i8,
  u8,
  i16,
  u16,
  i32,
  u32,
  i64,
  u64,
  f16,
  f32,
  string,
  type Bool,
  type Int8,
  type Uint8,
  type Int16,
  type Uint16,
  type Int32,
  type Uint32,
  type Int64,
  type Uint64,
  type Float16,
  type Float32,
  type String,
} from './structure/baseTypes.ts';
export { chars, type Chars } from './structure/chars.ts';
export { inherent, type Inherent } from './structure/inherent.ts';
export { pipe, type Pipe, type PipeAction } from './structure/pipe.ts';
export { concat } from './structure/concat.ts';
export { dynamicArray, type DynamicArray } from './structure/dynamicArray.ts';
export { struct, type Struct } from './structure/struct.ts';
export { optional, type Optional } from './structure/optional.ts';
export { tuple, type Tuple } from './structure/tuple.ts';
export { union, type Union, type UnionOptions, type UnionVariant } from './structure/union.ts';
export { prefixEnum, orderedEnum, type PrefixEnum, type OrderedEnum } from './structure/enum.ts';
export {
  f32Array,
  f64Array,
  i16Array,
  i32Array,
  i8Array,
  u16Array,
  u32Array,
  u8Array,
  u8ClampedArray,
  type TypedArray,
} from './structure/typedArray.ts';
export { MaxValue } from './structure/types.ts';

export { cursor } from './io/cursor.ts';
export { getSystemEndianness } from './util.ts';
export { ValidationError, InvalidSchemaShapeError } from './error.ts';

export type { ByteCursor, CursorOptions } from './io/cursor.ts';
export type { Endianness } from './io/types.ts';
export type { ExtractIn, ExtractOut, Schema, WithSchema } from './structure/types.ts';
