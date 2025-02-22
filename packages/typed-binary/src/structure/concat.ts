import type { MergeRecordUnion } from '../utilityTypes.ts';
import { type AnyObjectSchema, ObjectSchema } from './object.ts';
import type { PropertiesOf } from './types.ts';

type Concat<Objs extends AnyObjectSchema[]> = ObjectSchema<
  MergeRecordUnion<PropertiesOf<Objs[number]>>
>;

// @__NO_SIDE_EFFECTS__
export function concat<Objs extends AnyObjectSchema[]>(
  objs: Objs,
): Concat<Objs> {
  return new ObjectSchema(
    Object.fromEntries(
      objs.flatMap(({ properties }) => Object.entries(properties)),
    ) as unknown as Concat<Objs>['properties'],
  );
}
