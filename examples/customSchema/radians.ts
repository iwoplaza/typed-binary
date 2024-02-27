import {
  ISerialInput,
  ISerialOutput,
  Schema,
  MaxValue,
  IMeasurer,
  Measurer,
} from 'typed-binary';

/**
 * A schema storing radians with 2 bytes of precision.
 */
class RadiansSchema extends Schema<number> {
  read(input: ISerialInput): number {
    const low = input.readByte();
    const high = input.readByte();

    const discrete = (high << 8) | low;
    return (discrete / 65535) * Math.PI;
  }

  write(output: ISerialOutput, value: number): void {
    // The value will be wrapped to be in range of [0, Math.PI)
    const wrapped = ((value % Math.PI) + Math.PI) % Math.PI;
    // Clipping the value to be ints in range of [0, 65535]
    const discrete = Math.min(Math.floor((wrapped / Math.PI) * 65535), 65535);

    const low = discrete & 0xff;
    const high = (discrete >> 8) & 0xff;

    output.writeByte(low);
    output.writeByte(high);
  }

  measure(
    _: number | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    // The size of the data serialized by this schema
    // doesn't depend on the actual value. It's always 2 bytes.
    return measurer.add(2);
  }
}

export const radians = new RadiansSchema();
