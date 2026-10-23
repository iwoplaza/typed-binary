import { hasProcess } from '../env.ts';
import { ValidationError } from '../error.ts';
import type { ByteCursor } from '../io/cursor.ts';
import { MaxValue, Schema } from './types.ts';

////
// PREFIX ENUM
////

export interface PrefixEnum<TValues extends string> extends Schema<TValues> {
  readonly values: readonly TValues[];
}

class PrefixEnumImpl<TValues extends string> implements PrefixEnum<TValues> {
  readonly values: readonly TValues[];

  constructor(values: readonly TValues[]) {
    this.values = values;
    if (hasProcess && process.env.NODE_ENV !== 'production') {
      // Each character is encoded as a single byte
      const nonAscii = values.find((value) => [...value].some((char) => char.charCodeAt(0) > 0x7f));
      if (nonAscii !== undefined) {
        throw new ValidationError(
          `Enum values can only contain ASCII characters, got '${nonAscii}'`,
        );
      }
      if (
        this.values.some((value, i) =>
          this.values.some((otherValue, j) => i !== j && value.startsWith(otherValue)),
        )
      ) {
        throw new ValidationError(
          `Enum values must be unique, and cannot be prefixes of each other`,
        );
      }
    }
  }

  write(cursor: ByteCursor, value: TValues): void {
    if (hasProcess && process.env.NODE_ENV !== 'production' && !this.values.includes(value)) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }

    for (let i = 0; i < value.length; ++i) {
      cursor.view.setUint8(cursor.offset++, value.charCodeAt(i));
    }
  }

  read(cursor: ByteCursor): TValues {
    let content = '';

    const possibleMatches = new Set(this.values);
    while (possibleMatches.size > 0) {
      content += String.fromCharCode(cursor.view.getUint8(cursor.offset++));
      for (const possibleMatch of possibleMatches) {
        if (possibleMatch === content) {
          return possibleMatch;
        }
        if (!possibleMatch.startsWith(content)) {
          possibleMatches.delete(possibleMatch);
        }
      }
    }

    throw new ValidationError(`Expected enum value, got ${content}`);
  }

  measure(value: string | MaxValue): number {
    if (value === MaxValue) {
      return this.values.reduce((max, value) => Math.max(max, value.length), 0);
    }
    if (
      hasProcess &&
      process.env.NODE_ENV !== 'production' &&
      !this.values.includes(value as TValues)
    ) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }
    return value.length;
  }
}

/**
 * Encodes values as their ASCII characters, one byte each, with no length or terminator.
 * Values are read until they match one of the enum values, which is why
 * no value can be a prefix of another. Keeps the encoding independent of the order
 * of values, at the cost of a variable size.
 */
/*#__NO_SIDE_EFFECTS__*/
export function prefixEnum<T extends readonly [string, ...string[]]>(
  ...values: T
): PrefixEnum<T[number]> {
  return new PrefixEnumImpl(values);
}

////
// ORDERED ENUM
////

export interface OrderedEnum<TValues extends string> extends Schema<TValues> {
  readonly values: readonly TValues[];

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Alias for `.measure(MaxValue)`
   */
  readonly maxSize: 1;
}

class OrderedEnumImpl<TValues extends string> implements OrderedEnum<TValues> {
  readonly values: readonly TValues[];
  get maxSize(): 1 {
    return 1;
  }

  constructor(values: readonly TValues[]) {
    this.values = values;
    if (hasProcess && process.env.NODE_ENV !== 'production') {
      if (new Set(values).size !== values.length) {
        throw new ValidationError(`Enum values must be unique`);
      }
      if (values.length > 256) {
        throw new ValidationError(
          `Ordered enums can have at most 256 values, got ${values.length}`,
        );
      }
    }
  }

  write(cursor: ByteCursor, value: TValues): void {
    const index = this.values.indexOf(value);
    if (hasProcess && process.env.NODE_ENV !== 'production' && index === -1) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }
    cursor.view.setUint8(cursor.offset++, index);
  }

  read(cursor: ByteCursor): TValues {
    const index = cursor.view.getUint8(cursor.offset++);
    if (index >= this.values.length) {
      throw new ValidationError(`Expected enum index below ${this.values.length}, got ${index}`);
    }
    return this.values[index] as TValues;
  }

  measure(value: string | MaxValue): number {
    if (
      hasProcess &&
      process.env.NODE_ENV !== 'production' &&
      value !== MaxValue &&
      !this.values.includes(value as TValues)
    ) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }
    return 1;
  }
}

/**
 * Encodes values as their index, in a single byte. Changing the order of
 * values changes the encoding, so new values should be appended at the end.
 */
/*#__NO_SIDE_EFFECTS__*/
export function orderedEnum<T extends readonly [string, ...string[]]>(
  ...values: T
): OrderedEnum<T[number]> {
  return new OrderedEnumImpl(values);
}
