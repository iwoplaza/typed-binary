import { BufferReader } from '../../io/bufferReader.ts';
import { BufferWriter } from '../../io/bufferWriter.ts';
import type { AnySchema } from '../../structure/types.ts';
import type { Parsed } from '../../utilityTypes.ts';

export function makeIO(bufferSize: number) {
  const buffer = new ArrayBuffer(bufferSize);

  return {
    output: new BufferWriter(buffer),
    input: new BufferReader(buffer),
  };
}

export function encodeAndDecode<T extends AnySchema>(
  schema: T,
  value: Parsed<T>,
): Parsed<T> {
  const buffer = new ArrayBuffer(schema.measure(value).size);

  schema.write(new BufferWriter(buffer), value);

  return schema.read(new BufferReader(buffer)) as Parsed<T>;
}
