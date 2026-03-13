import bin from 'typed-binary';

import { BufferReader } from '../../io/bufferReader.ts';
import { BufferWriter } from '../../io/bufferWriter.ts';
import type { AnySchema } from '../../structure/types.ts';

export function makeIO(bufferSize: number) {
  const buffer = new ArrayBuffer(bufferSize);

  return {
    output: new BufferWriter(buffer),
    input: new BufferReader(buffer),
  };
}

export function encodeAndDecode<T extends AnySchema>(
  schema: T,
  value: bin.ExtractIn<T>,
): bin.ExtractOut<T> {
  const buffer = new ArrayBuffer(schema.measure(value).size);
  schema.write(new BufferWriter(buffer), value);
  return schema.read(new BufferReader(buffer));
}
