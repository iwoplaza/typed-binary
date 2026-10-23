import { hasProcess } from '../env.ts';
import { ValidationError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import type { MaxValue, Schema } from './types.ts';

/**
 * A value that is already known from context (e.g. read earlier in a `bin.pipe`),
 * so it takes up no space in the binary representation.
 */
export interface Inherent<T> extends Schema<T> {
  readonly value: T;
  readonly maxSize: 0;
}

class InherentImpl<T> implements Inherent<T> {
  readonly value: T;
  get maxSize(): 0 {
    return 0;
  }

  constructor(value: T) {
    this.value = value;
  }

  write(_cursor: ByteCursor, value: T): void {
    if (hasProcess && process.env.NODE_ENV !== 'production' && value !== this.value) {
      throw new ValidationError(
        `Expected inherent value ${String(this.value)}, got ${String(value)}`,
      );
    }
  }

  read(_cursor: ByteCursor): T {
    return this.value;
  }

  measure(_value: T | MaxValue): number {
    return 0;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function inherent<const T>(value: T): Inherent<T> {
  return new InherentImpl(value);
}
