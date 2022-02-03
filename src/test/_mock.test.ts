import { BufferReader, BufferWriter } from '../io';
import { IStableSchema } from '../structure/types';
import { Parsed } from '../utilityTypes';

export function makeIO(bufferSize: number) {
    const buffer = Buffer.alloc(bufferSize);
    return {
        output: new BufferWriter(buffer),
        input: new BufferReader(buffer),
    };
}

export function encodeAndDecode<T extends IStableSchema<unknown>>(schema: T, value: Parsed<T>): Parsed<T> {
    const buffer = Buffer.alloc(schema.sizeOf(value));

    schema.write(new BufferWriter(buffer), value);

    return schema.read(new BufferReader(buffer)) as Parsed<T>;
}
