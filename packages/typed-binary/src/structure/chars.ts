import { ValidationError } from '../error.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { Measurer } from '../io/measurer.ts';
import { Schema } from './types.ts';

export class CharsSchema extends Schema<string> {
  constructor(public readonly length: number) {
    super();
  }

  write(output: ISerialOutput, value: string): void {
    if (value.length !== this.length) {
      throw new ValidationError(
        `Expected char-string of length ${this.length}, got ${value.length}`,
      );
    }

    for (let i = 0; i < value.length; ++i) {
      output.writeUint8(value.charCodeAt(i));
    }
  }

  read(input: ISerialInput): string {
    let content = '';

    for (let i = 0; i < this.length; ++i) {
      content += String.fromCharCode(input.readByte());
    }

    return content;
  }

  measure(_: string, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(this.length);
  }
}

export const chars = <T extends number>(length: T) => new CharsSchema(length);
