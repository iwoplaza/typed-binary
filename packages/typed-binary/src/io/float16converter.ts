export function numberToFloat16(value: number): Uint16Array {
  // conversion according to IEEE 754 binary16 format
  if (value === 0) return new Uint16Array([0]);
  if (Number.isNaN(value)) return new Uint16Array([0x7e00]);
  if (!Number.isFinite(value))
    return new Uint16Array([value > 0 ? 0x7c00 : 0xfc00]);

  const sign = value < 0 ? 1 : 0;
  const absValue = Math.abs(value);
  const exponent = Math.floor(Math.log2(absValue));
  const mantissa = absValue / 2 ** exponent - 1;
  const biasedExponent = exponent + 15;
  const mantissaBits = Math.floor(mantissa * 1024);
  const float16 = (sign << 15) | (biasedExponent << 10) | mantissaBits;
  const uint16Array = new Uint16Array(1);
  uint16Array[0] = float16;
  return uint16Array;
}

export function float16ToNumber(uint16Array: Uint16Array): number {
  const float16 = uint16Array[0];
  const sign = (float16 & 0x8000) >> 15;
  const exponent = (float16 & 0x7c00) >> 10;
  const mantissa = float16 & 0x3ff;
  if (exponent === 0) {
    return sign === 0 ? mantissa / 1024 : -mantissa / 1024;
  }
  if (exponent === 31) {
    return mantissa === 0
      ? sign === 0
        ? Number.POSITIVE_INFINITY
        : Number.NEGATIVE_INFINITY
      : Number.NaN;
  }
  return (sign === 0 ? 1 : -1) * (1 + mantissa / 1024) * 2 ** (exponent - 15);
}
