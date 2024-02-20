import {
  Measurer,
  type IMeasurer,
  type ISerialInput,
  type ISerialOutput,
} from '../io';
import { ParseUnwrappedRecord, Parsed } from '../utilityTypes';
import { byte, string } from './baseTypes';
import {
  Schema,
  IRefResolver,
  ISchemaWithProperties,
  MaxValue,
  AnySchema,
  AnySchemaWithProperties,
  ISchema,
  PropertyDescription,
  Unwrap,
  UnwrapRecord,
  SubTypeKey,
} from './types';

export function exactEntries<T extends Record<keyof T, T[keyof T]>>(
  record: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(record) as [keyof T, T[keyof T]][];
}

export function resolveMap<T extends Record<string, AnySchema>>(
  ctx: IRefResolver,
  refs: T,
): T {
  const props = {} as T;

  for (const [key, ref] of exactEntries(refs)) {
    props[key] = ctx.resolve(ref);
  }

  return props;
}

export type AnyObjectSchema = ObjectSchema<Record<string, AnySchema>>;

export class ObjectSchema<TProps extends Record<string, AnySchema>>
  extends Schema<UnwrapRecord<TProps>>
  implements ISchemaWithProperties<TProps>
{
  public properties: TProps;

  constructor(private readonly _properties: TProps) {
    super();

    // In case this object isn't part of a keyed chain,
    // let's assume properties are stable.
    this.properties = _properties;
  }

  resolve(ctx: IRefResolver): void {
    this.properties = resolveMap(ctx, this._properties);
  }

  write(output: ISerialOutput, value: ParseUnwrappedRecord<TProps>): void {
    type Property = keyof ParseUnwrappedRecord<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      property.write(output, value[key as Property]);
    }
  }

  read(input: ISerialInput): ParseUnwrappedRecord<TProps> {
    type Property = keyof ParseUnwrappedRecord<TProps>;

    const result = {} as ParseUnwrappedRecord<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      result[key as Property] = property.read(input) as Parsed<
        UnwrapRecord<TProps>
      >[Property];
    }

    return result;
  }

  measure(
    value: ParseUnwrappedRecord<TProps> | typeof MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    type Property = keyof ParseUnwrappedRecord<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      property.measure(
        value === MaxValue ? MaxValue : value[key as Property],
        measurer,
      );
    }

    return measurer;
  }

  seekProperty(
    reference: ParseUnwrappedRecord<TProps> | MaxValue,
    prop: keyof UnwrapRecord<TProps>,
  ): PropertyDescription | null {
    let bufferOffset = 0;

    for (const [key, property] of exactEntries(this.properties)) {
      if (key === prop) {
        return {
          bufferOffset,
          schema: property,
        };
      }

      bufferOffset += property.measure(reference).size;
    }

    return null;
  }
}

type UnwrapGeneric<Base extends Record<string, AnySchema>, Ext> = {
  [TKey in keyof Ext]: ISchema<
    UnwrapRecord<Base> & { type: TKey } & UnwrapRecord<Unwrap<Ext[TKey]>>
  >;
}[keyof Ext];

export class GenericObjectSchema<
  TUnwrapBase extends Record<string, AnySchema>, // Base properties
  TUnwrapExt extends Record<string, AnySchemaWithProperties>, // Sub type map
> extends Schema<UnwrapGeneric<TUnwrapBase, TUnwrapExt>> {
  private _baseObject: ObjectSchema<TUnwrapBase>;
  public subTypeMap: TUnwrapExt;

  constructor(
    public readonly keyedBy: SubTypeKey,
    properties: TUnwrapBase,
    private readonly _subTypeMap: TUnwrapExt,
  ) {
    super();

    this._baseObject = new ObjectSchema(properties);

    // In case this object isn't part of a keyed chain,
    // let's assume sub types are stable.
    this.subTypeMap = _subTypeMap;
  }

  resolve(ctx: IRefResolver): void {
    this._baseObject.resolve(ctx);
    this.subTypeMap = resolveMap(ctx, this._subTypeMap);
  }

  write(
    output: ISerialOutput,
    value: Parsed<UnwrapGeneric<TUnwrapBase, TUnwrapExt>>,
  ): void {
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
      output.writeByte(value.type as number);
    } else {
      output.writeString(value.type as string);
    }

    // Writing the base properties
    this._baseObject.write(output, value as ParseUnwrappedRecord<TUnwrapBase>);

    // Extra sub-type fields
    for (const [key, extraProp] of exactEntries(
      subTypeDescription.properties,
    )) {
      extraProp.write(output, value[key]);
    }
  }

  read(input: ISerialInput): Parsed<UnwrapGeneric<TUnwrapBase, TUnwrapExt>> {
    const subTypeKey =
      this.keyedBy === SubTypeKey.ENUM ? input.readByte() : input.readString();

    const subTypeDescription =
      this.subTypeMap[subTypeKey as keyof TUnwrapExt] || null;
    if (subTypeDescription === null) {
      throw new Error(
        `Unknown sub-type '${subTypeKey}' in among '${JSON.stringify(
          Object.keys(this.subTypeMap),
        )}'`,
      );
    }

    const result = this._baseObject.read(input) as Parsed<
      UnwrapGeneric<TUnwrapBase, TUnwrapExt>
    >;

    // Making the sub type key available to the result object.
    (result as { type: keyof TUnwrapExt }).type =
      subTypeKey as keyof TUnwrapExt;

    if (subTypeDescription !== null) {
      for (const [key, extraProp] of exactEntries(
        subTypeDescription.properties,
      )) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (result as any)[key] = extraProp.read(input);
      }
    }

    return result;
  }

  measure(
    value: Parsed<UnwrapGeneric<TUnwrapBase, TUnwrapExt>> | MaxValue,
    measurer: IMeasurer = new Measurer(),
  ): IMeasurer {
    this._baseObject.measure(
      value as Parsed<UnwrapRecord<TUnwrapBase>> | MaxValue,
      measurer,
    );

    // We're a generic object trying to encode a concrete value.
    if (this.keyedBy === SubTypeKey.ENUM) {
      byte.measure(0, measurer);
    } else if (value !== MaxValue) {
      string.measure(value.type as string, measurer);
    } else {
      // 'type' can be a string of any length, so the schema is unbounded.
      return measurer.unbounded;
    }

    // Extra sub-type fields
    if (value === MaxValue) {
      const biggestSubType = (
        Object.values(this.subTypeMap) as TUnwrapExt[keyof TUnwrapExt][]
      )
        .map((subType) => {
          const forkedMeasurer = measurer.fork();

          Object.values(subType.properties) // Going through extra properties
            .forEach((prop) => prop.measure(MaxValue, forkedMeasurer)); // Measuring them

          return [subType, forkedMeasurer.size] as const;
        })
        .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

      // Measuring for real this time
      Object.values(biggestSubType.properties) // Going through extra properties
        .forEach((prop) => prop.measure(MaxValue, measurer));
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

      exactEntries(subTypeDescription.properties) // Going through extra properties
        .forEach(([key, prop]) => prop.measure(value[key], measurer)); // Measuring them
    }

    return measurer;
  }
}
