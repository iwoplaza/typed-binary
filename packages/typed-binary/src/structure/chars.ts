import { ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import { Schema } from './types.ts';

export interface Chars<TLength extends number = number> extends Schema<string> {
  readonly length: TLength;
}

class CharsSchema<TLength extends number = number> implements Chars<TLength> {
  readonly length: TLength;

  constructor(length: TLength) {
    this.length = length;
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
      content += String.fromCharCode(input.readUint8());
    }

    return content;
  }

  measure(_: string, measurer: IMeasurer = new Measurer()): IMeasurer {
    return measurer.add(this.length);
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function chars<T extends number>(length: T): Chars<T> {
  return new CharsSchema(length);
}
