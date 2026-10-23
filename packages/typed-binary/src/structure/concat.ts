import { hasProcess } from '../env.ts';
import { InvalidSchemaShapeError } from '../error.ts';
import type { MergeRecordUnion, Prettify } from '../utilityTypes.ts';
import { struct, type Struct } from './struct.ts';
import { toSchema, type UnwrapSchema } from './types.ts';

type StructLike = Struct | { readonly ['~typed-binary']: { readonly schema: Struct } };

type Concat<Objs extends readonly StructLike[]> = MergeRecordUnion<
  UnwrapSchema<Objs[number]>['properties']
>;

/*#__NO_SIDE_EFFECTS__*/
export function concat<Objs extends readonly StructLike[]>(
  objs: Objs,
): Struct<Prettify<Concat<Objs>>> {
  const properties = {};
  for (const obj of objs) {
    const schema = toSchema(obj) as Struct;
    if (hasProcess && process.env.NODE_ENV !== 'production' && !schema?.properties) {
      throw new InvalidSchemaShapeError(`bin.concat(...) expects structs, got '${String(obj)}'`);
    }
    // Copying property descriptors (instead of values), so that getters stay lazy,
    // which is required for recursive references.
    Object.defineProperties(properties, Object.getOwnPropertyDescriptors(schema.properties));
  }
  return struct(properties) as Struct<Concat<Objs>>;
}
