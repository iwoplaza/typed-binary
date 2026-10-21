import * as bin from 'typed-binary';

import { cursor } from '../../io/cursor.ts';
import type { Schema } from '../../structure/types.ts';

export function makeIO(bufferSize: number) {
  const buffer = new ArrayBuffer(bufferSize);

  return {
    output: cursor(buffer),
    input: cursor(buffer),
  };
}

export function encodeAndDecode<T extends Schema>(
  schema: T,
  value: bin.ExtractIn<T>,
): bin.ExtractOut<T> {
  const buffer = new ArrayBuffer(schema.measure(value).size);
  schema.write(cursor(buffer), value);
  return schema.read(cursor(buffer));
}
