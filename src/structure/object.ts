import type { ISerialInput, ISerialOutput } from '../io';
import type { OptionalUndefined, ValueOrProvider } from '../utilityTypes';
import { STRING } from './baseTypes';
import {
    Schema, InferedProperties, SchemaProperties
} from './types';
import { SubTypeKey } from './types';


export class ObjectSchema<
    T extends SchemaProperties,
    O extends InferedProperties<T> = InferedProperties<T>
> extends Schema<O> {
    private cachedProperties?: T;

    constructor(private readonly _properties: ValueOrProvider<T>) {
        super();
    }

    public get properties() {
        return this.cachedProperties || (
            this.cachedProperties = (typeof this._properties === 'function' ? this._properties() : this._properties)
        );
    }

    write(output: ISerialOutput, value: OptionalUndefined<O>): void {
        const keys: string[] = Object.keys(this.properties);

        for (const key of keys) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.properties[key].write(output, (value as any)[key]);
        }
    }

    read(input: ISerialInput): OptionalUndefined<O> {
        const keys: (keyof T)[] = Object.keys(this.properties);
        const result = {} as OptionalUndefined<O>;

        for (const key of keys) {
            const value = this.properties[key].read(input) as O[typeof key];
            if (value !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (result as any)[key] = value;
            }
        }

        return result;
    }

    sizeOf(value: OptionalUndefined<O>): number {
        let size = 0;

        // Going through the base properties
        size += Object.keys(this.properties)
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      .map(key => this.properties[key].sizeOf((value as any)[key])) // Mapping properties into their sizes.
                      .reduce((a, b) => a + b); // Summing them up

        return size;
    }
}

export type InferedSubTypes<T extends {[key in keyof T]: ObjectSchema<SchemaProperties>}> = {
    [Key in keyof T]: T[Key]['_infered'] & { type: Key }
};

export type ObjectSchemaMap<S, SI extends {[key in keyof SI]: SI[key]}> = {[key in keyof S]: ObjectSchema<SI[key]>};

export class GenericObjectSchema<
    T extends SchemaProperties, // Base properties
    S extends {[Key in keyof S]: ObjectSchema<SchemaProperties>}, // Sub type map
    K extends string|number,
    I extends InferedProperties<T> & InferedSubTypes<S>[keyof S] = InferedProperties<T> & InferedSubTypes<S>[keyof S]
> extends ObjectSchema<T, I> {
    constructor(
        public readonly keyedBy: K,
        properties: ValueOrProvider<T>,
        private readonly subTypeMap: ValueOrProvider<S>
    ) {
        super(properties);
    }

    private getSubTypeMap(): S {
        return typeof this.subTypeMap === 'function' ? this.subTypeMap() : this.subTypeMap;
    }

    write(output: ISerialOutput, value: OptionalUndefined<I>): void {
        // Figuring out sub-types
        const subTypeDescription = this.getSubTypeMap()[(value as I).type] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${(value as I).type.toString()}' in among '${JSON.stringify(Object.keys(this.subTypeMap))}'`);
        }

        // Writing the sub-type out.
        if (this.keyedBy === SubTypeKey.ENUM) {
            output.writeByte((value as I).type as number);
        }
        else {
            output.writeString((value as I).type as string);
        }

        // Writing the base properties
        super.write(output, value);

        // Extra sub-type fields
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const extraKeys: string[] = Object.keys(subTypeDescription.properties);
    
        for (const key of extraKeys) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const prop: Schema<unknown> = subTypeDescription.properties[key];
    
            prop.write(output, (value as I)[key]);
        }
    }

    read(input: ISerialInput): OptionalUndefined<I> {
        const subTypeMap = this.getSubTypeMap();
        const subTypeKey = this.keyedBy === SubTypeKey.ENUM ? input.readByte() : input.readString();

        const subTypeDescription = subTypeMap[subTypeKey as keyof S] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${subTypeKey}' in among '${JSON.stringify(Object.keys(subTypeMap))}'`);
        }

        const result = super.read(input);

        // Making the sub type key available to the result object.
        (result as I).type = subTypeKey as keyof S;

        if (subTypeDescription !== null) {
            const extraKeys = Object.keys(subTypeDescription.properties);
        
            for (const key of extraKeys) {
                const prop = (subTypeDescription.properties)[key];
                const value = prop.read(input);
                if (value !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    (result as any)[key] = value;
                }
            }
        }

        return result;
    }

    sizeOf(value: OptionalUndefined<I>): number {
        let size = super.sizeOf(value);

        // We're a generic object trying to encode a concrete value.
        size += this.keyedBy === SubTypeKey.ENUM ? 1 : STRING.sizeOf((value as I).type as string);

        // Extra sub-type fields
        const subTypeDescription = this.getSubTypeMap()[(value as I).type] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${(value as I).type.toString()}' in among '${JSON.stringify(Object.keys(this.subTypeMap))}'`);
        }

        size += Object.keys(subTypeDescription.properties) // Going through extra property keys
                        .map(key => subTypeDescription.properties[key].sizeOf((value as I)[key])) // Mapping extra properties into their sizes
                        .reduce((a, b) => a + b, 0); // Summing them up
    
        return size;
    }
}
