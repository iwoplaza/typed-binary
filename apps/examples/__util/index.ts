import * as bin from 'typed-binary';

export function writeAndRead<TSchema extends bin.Schema>(
  schema: TSchema,
  value: bin.ExtractIn<TSchema>,
): bin.ExtractOut<TSchema> {
  const buffer = new ArrayBuffer(schema.measure(value).size);
  const writer = new bin.BufferWriter(buffer);
  const reader = new bin.BufferReader(buffer);

  schema.write(writer, value);
  return schema.read(reader);
}
