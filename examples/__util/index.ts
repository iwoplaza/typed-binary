import { BufferWriter, BufferReader, Schema } from 'typed-binary';

export function writeAndRead<T>(schema: Schema<T>, value: T) {
    const buffer = Buffer.alloc(schema.sizeOf(value));
    const writer = new BufferWriter(buffer);
    const reader = new BufferReader(buffer);

    schema.write(writer, value);
    return schema.read(reader);
}
