import * as bin from 'typed-binary';

export function writeAndRead<TSchema extends bin.Schema>(
  schema: TSchema,
  value: bin.ExtractIn<TSchema>,
): bin.ExtractOut<TSchema> {
  const buffer = new ArrayBuffer(schema.measure(value));
  const writer = bin.cursor(buffer);
  const reader = bin.cursor(buffer);

  schema.write(writer, value);
  return schema.read(reader);
}
