import {
  type AnySchema,
  BufferReader,
  BufferWriter,
  type Parsed,
} from 'typed-binary';

export function writeAndRead<TSchema extends AnySchema>(
  schema: TSchema,
  value: Parsed<TSchema>,
) {
  const buffer = Buffer.alloc(schema.measure(value).size);
  const writer = new BufferWriter(buffer);
  const reader = new BufferReader(buffer);

  schema.write(writer, value);
  return schema.read(reader);
}
