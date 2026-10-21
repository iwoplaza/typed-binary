import { ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { ByteCursor } from '../io/cursor.ts';
import { Schema } from './types.ts';

export interface Chars<TLength extends number = number> extends Schema<string> {
  readonly length: TLength;
}

class CharsImpl<TLength extends number = number> implements Chars<TLength> {
  readonly length: TLength;

  constructor(length: TLength) {
    this.length = length;
  }

  write(cursor: ByteCursor, value: string): void {
    if (value.length !== this.length) {
      throw new ValidationError(
        `Expected char-string of length ${this.length}, got ${value.length}`,
      );
    }

    for (let i = 0; i < value.length; ++i) {
      cursor.view.setUint8(cursor.offset++, value.charCodeAt(i));
    }
  }

  read(cursor: ByteCursor): string {
    let content = '';

    for (let i = 0; i < this.length; ++i) {
      content += String.fromCharCode(cursor.view.getUint8(cursor.offset++));
    }

    return content;
  }

  measure(_: string, measurer: Measurer = new Measurer()): Measurer {
    return measurer.add(this.length);
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function chars<T extends number>(length: T): Chars<T> {
  return new CharsImpl(length);
}
