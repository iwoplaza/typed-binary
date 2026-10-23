const schemasBeingMeasured = new Set<object>();

/**
 * Measures the max size of a schema that can (directly or indirectly) contain itself.
 * If the schema is already being measured further up the stack, it is recursive,
 * so its max size is unbounded (`NaN`).
 */
export function measureMax(schema: object, measure: () => number): number {
  if (schemasBeingMeasured.has(schema)) {
    return Number.NaN;
  }

  schemasBeingMeasured.add(schema);
  try {
    return measure();
  } finally {
    schemasBeingMeasured.delete(schema);
  }
}
