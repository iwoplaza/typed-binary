import { Measurer } from '../io/measurer.ts';
import type { IMeasurer, ISerialInput, ISerialOutput } from '../io/types.ts';
import type { ParseUnwrappedRecord, Parsed } from '../utilityTypes.ts';
import {
  type AnySchema,
  type AnySchemaWithProperties,
  type IRefResolver,
  type ISchema,
  type ISchemaWithProperties,
  MaxValue,
  type PropertyDescription,
  Schema,
  SubTypeKey,
  type Unwrap,
  type UnwrapRecord,
} from './types.ts';

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

  override resolveReferences(ctx: IRefResolver): void {
    this.properties = resolveMap(ctx, this._properties);
  }

  override write(
    output: ISerialOutput,
    value: ParseUnwrappedRecord<TProps>,
  ): void {
    type Property = keyof ParseUnwrappedRecord<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      property.write(output, value[key as Property]);
    }
  }

  override read(input: ISerialInput): ParseUnwrappedRecord<TProps> {
    type Property = keyof ParseUnwrappedRecord<TProps>;

    const result = {} as ParseUnwrappedRecord<TProps>;

    for (const [key, property] of exactEntries(this.properties)) {
      result[key as Property] = property.read(input) as Parsed<
        UnwrapRecord<TProps>
      >[Property];
    }

    return result;
  }

  /**
   * The maximum number of bytes this schema can take up.
   *
   * Is `NaN` if the schema is unbounded. If you would like to know
   * how many bytes a particular value encoding will take up, use `.measure(value)`.
   *
   * Alias for `.measure(MaxValue).size`
   */
  get maxSize(): number {
    const measurer = new Measurer();

    for (const property of Object.values(this.properties)) {
      property.measure(MaxValue, measurer);
    }

    return measurer.size;
  }

  override measure(
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

  override seekProperty(
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

export function object<P extends Record<string, AnySchema>>(
  properties: P,
): ObjectSchema<P> {
  return new ObjectSchema(properties);
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

  override resolveReferences(ctx: IRefResolver): void {
    this._baseObject.resolveReferences(ctx);
    this.subTypeMap = resolveMap(ctx, this._subTypeMap);
  }

  override write(
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
      output.writeUint8(value.type as number);
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

  override read(
    input: ISerialInput,
  ): Parsed<UnwrapGeneric<TUnwrapBase, TUnwrapExt>> {
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
        // biome-ignore lint/suspicious/noExplicitAny: <covered by tests>
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
      measurer.add(1);
    } else if (value !== MaxValue) {
      measurer.add((value.type as string).length + 1);
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

export function generic<
  P extends Record<string, AnySchema>,
  S extends {
    [Key in keyof S]: AnySchemaWithProperties;
  },
>(properties: P, subTypeMap: S): GenericObjectSchema<P, S> {
  return new GenericObjectSchema(SubTypeKey.STRING, properties, subTypeMap);
}

export function genericEnum<
  P extends Record<string, AnySchema>,
  S extends {
    [Key in keyof S]: AnySchemaWithProperties;
  },
>(properties: P, subTypeMap: S): GenericObjectSchema<P, S> {
  return new GenericObjectSchema(SubTypeKey.ENUM, properties, subTypeMap);
}
