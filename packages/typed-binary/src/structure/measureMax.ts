import type { IMeasurer } from '../io/types.ts';

const schemasBeingMeasured = new Set<object>();

/**
 * Measures the max size of a schema that can (directly or indirectly) contain itself.
 * If the schema is already being measured further up the stack, it is recursive,
 * so its max size is unbounded.
 */
export function measureMax(schema: object, measurer: IMeasurer, measure: () => void): IMeasurer {
  if (schemasBeingMeasured.has(schema)) {
    return measurer.unbounded;
  }

  schemasBeingMeasured.add(schema);
  try {
    measure();
  } finally {
    schemasBeingMeasured.delete(schema);
  }

  return measurer;
}
