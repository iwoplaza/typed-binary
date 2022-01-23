import { BufferReader, BufferWriter } from '../io';

export function makeIO(bufferSize: number) {
    const buffer = new ArrayBuffer(bufferSize);
    return {
        output: new BufferWriter(buffer),
        input: new BufferReader(buffer),
    };
}