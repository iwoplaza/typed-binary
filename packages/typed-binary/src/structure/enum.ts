import { ValidationError } from '../error.ts';
import { Measurer } from '../io/measurer.ts';
import type { SerialInput, SerialOutput } from '../io/types.ts';
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
    // Each character is encoded as a single byte
    const nonAscii = values.find((value) => [...value].some((char) => char.charCodeAt(0) > 0x7f));
    if (nonAscii !== undefined) {
      throw new ValidationError(`Enum values can only contain ASCII characters, got '${nonAscii}'`);
    }
    if (
      this.values.some((value, i) =>
        this.values.some((otherValue, j) => i !== j && value.startsWith(otherValue)),
      )
    ) {
      throw new ValidationError(`Enum values must be unique, and cannot be prefixes of each other`);
    }
  }

  write(output: SerialOutput, value: TValues): void {
    if (!this.values.includes(value)) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }

    for (let i = 0; i < value.length; ++i) {
      output.writeUint8(value.charCodeAt(i));
    }
  }

  read(input: SerialInput): TValues {
    let content = '';

    const possibleMatches = new Set(this.values);
    while (possibleMatches.size > 0) {
      content += String.fromCharCode(input.readUint8());
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

  measure(value: string | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    if (value === MaxValue) {
      return measurer.add(this.values.reduce((max, value) => Math.max(max, value.length), 0));
    }
    if (!this.values.includes(value as TValues)) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }
    return measurer.add(value.length);
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
   * Alias for `.measure(MaxValue).size`
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
    if (new Set(values).size !== values.length) {
      throw new ValidationError(`Enum values must be unique`);
    }
    if (values.length > 256) {
      throw new ValidationError(`Ordered enums can have at most 256 values, got ${values.length}`);
    }
  }

  write(output: SerialOutput, value: TValues): void {
    const index = this.values.indexOf(value);
    if (index === -1) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }
    output.writeUint8(index);
  }

  read(input: SerialInput): TValues {
    const index = input.readUint8();
    if (index >= this.values.length) {
      throw new ValidationError(`Expected enum index below ${this.values.length}, got ${index}`);
    }
    return this.values[index] as TValues;
  }

  measure(value: string | MaxValue, measurer: Measurer = new Measurer()): Measurer {
    if (value !== MaxValue && !this.values.includes(value as TValues)) {
      throw new ValidationError(`Expected enum value, got ${value}`);
    }
    return measurer.add(1);
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
