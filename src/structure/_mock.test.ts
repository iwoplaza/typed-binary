import { BufferReader, BufferWriter } from '../io';

export function makeIO(bufferSize: number) {
    const buffer = Buffer.alloc(bufferSize);
    return {
        output: new BufferWriter(buffer),
        input: new BufferReader(buffer),
    };
}