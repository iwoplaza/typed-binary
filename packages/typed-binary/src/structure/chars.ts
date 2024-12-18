import { ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { Schema } from './types.ts';

export class CharsSchema<
  TLength extends number = number,
> extends Schema<string> {
  constructor(public readonly length: TLength) {
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

export function chars<T extends number>(length: T): CharsSchema<T> {
  return new CharsSchema(length);
}
