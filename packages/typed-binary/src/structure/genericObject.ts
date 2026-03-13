import { ISerialOutput } from '../main-api.ts';
import { ObjectSchema } from './struct.ts';
import { SubTypeKey, type ExtractInRecord, type ExtractOutRecord, type Schema } from './types.ts';

type TIn<Base extends Record<string, Schema>, Ext> = {
  [TKey in keyof Ext]: Schema<
    Readonly<ExtractInRecord<Base> & { type: TKey } & ExtractInRecord<Ext[TKey]>>
  >;
}[keyof Ext];

type TOut<Base extends Record<string, Schema>, Ext> = {
  [TKey in keyof Ext]: Schema<
    ExtractOutRecord<Base> & { type: TKey } & ExtractOutRecord<Ext[TKey]>
  >;
}[keyof Ext];

export class GenericObjectSchema<
  TBase extends Record<string, Schema>, // Base properties
  TExt extends Record<string, Record<string, Schema>>, // Sub type map
> implements Schema<TIn<TBase, TExt>, TOut<TBase, TExt>> {
  readonly keyedBy: SubTypeKey;
  #baseObject: ObjectSchema<TBase>;
  public subTypeMap: TExt;

  constructor(keyedBy: SubTypeKey, properties: TBase, subTypeMap: TExt) {
    this.keyedBy = keyedBy;
    this.subTypeMap = subTypeMap;
    this.#baseObject = new ObjectSchema(properties);
  }

  write(output: ISerialOutput, value: TIn<TBase, TExt>): void {
    // Figuring out sub-types

    const subTypeKey = value.type as keyof TUnwrapExt;
    const subTypeDescription = this.subTypeMap[subTypeKey] || null;
    if (subTypeDescription === null) {
      throw new Error(
        `Unknown sub-type '${subTypeKey.toString()}' in among '${JSON.stringify(
          Object.keys(this.subTypeMap),
        )}'`,
      );
    }

    // Writing the sub-type out.
    if (this.keyedBy === SubTypeKey.ENUM) {
      output.writeUint8(value.type as number);
    } else {
      output.writeString(value.type as string);
    }

    // Writing the base properties
    this._baseObject.write(output, value as ParseUnwrappedRecord<TUnwrapBase>);

    // Extra sub-type fields
    for (const [key, extraProp] of exactEntries(subTypeDescription.properties)) {
      extraProp.write(output, value[key]);
    }
  }

  override read(input: ISerialInput): Parsed<UnwrapGeneric<TUnwrapBase, TUnwrapExt>> {
    const subTypeKey = this.keyedBy === SubTypeKey.ENUM ? input.readByte() : input.readString();

    const subTypeDescription = this.subTypeMap[subTypeKey as keyof TUnwrapExt] || null;
    if (subTypeDescription === null) {
      throw new Error(
        `Unknown sub-type '${subTypeKey}' in among '${JSON.stringify(
          Object.keys(this.subTypeMap),
        )}'`,
      );
    }

    const result = this._baseObject.read(input) as Parsed<UnwrapGeneric<TUnwrapBase, TUnwrapExt>>;

    // Making the sub type key available to the result object.
    (result as { type: keyof TUnwrapExt }).type = subTypeKey as keyof TUnwrapExt;

    if (subTypeDescription !== null) {
      for (const [key, extraProp] of exactEntries(subTypeDescription.properties)) {
        (result as any)[key] = extraProp.read(input);
      }
    }

    return result;
  }

  measure(
    value: Parsed<UnwrapGeneric<TUnwrapBase, TUnwrapExt>> | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    this._baseObject.measure(value as Parsed<UnwrapRecord<TUnwrapBase>> | MaxValue, measurer);

    // We're a generic object trying to encode a concrete value.
    if (this.keyedBy === SubTypeKey.ENUM) {
      measurer.add(1);
    } else if (value !== MaxValue) {
      measurer.add((value.type as string).length + 1);
    } else {
      // 'type' can be a string of any length, so the schema is unbounded.
      return measurer.unbounded;
    }

    // Extra sub-type fields
    if (value === MaxValue) {
      const biggestSubType = (Object.values(this.subTypeMap) as TUnwrapExt[keyof TUnwrapExt][])
        .map((subType) => {
          const forkedMeasurer = measurer.fork();

          // Going through extra properties
          for (const prop of Object.values(subType.properties)) {
            // Measuring them
            prop.measure(MaxValue, forkedMeasurer);
          }

          return [subType, forkedMeasurer.size] as const;
        })
        .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

      // Going through extra properties
      for (const prop of Object.values(biggestSubType.properties)) {
        // Measuring for real this time
        prop.measure(MaxValue, measurer);
      }
    } else {
      const subTypeKey = (value as { type: keyof TUnwrapExt }).type;
      const subTypeDescription = this.subTypeMap[subTypeKey] || null;
      if (subTypeDescription === null) {
        throw new Error(
          `Unknown sub-type '${subTypeKey.toString()}', expected one of '${JSON.stringify(
            Object.keys(this.subTypeMap),
          )}'`,
        );
      }

      // Going through extra properties
      for (const [key, prop] of exactEntries(subTypeDescription.properties)) {
        // Measuring them
        prop.measure(value[key], measurer);
      }
    }

    return measurer;
  }
}

/*#__NO_SIDE_EFFECTS__*/
export function generic<
  P extends Record<string, Schema>,
  S extends Record<string, Record<string, Schema>>,
>(properties: P, subTypeMap: S): GenericObjectSchema<P, S> {
  return new GenericObjectSchema(SubTypeKey.STRING, properties, subTypeMap);
}

/*#__NO_SIDE_EFFECTS__*/
export function genericEnum<
  P extends Record<string, any>,
  S extends Record<string, Record<string, any>>,
>(properties: P, subTypeMap: S): GenericObjectSchema<P, S> {
  return new GenericObjectSchema(SubTypeKey.ENUM, properties, subTypeMap);
}
