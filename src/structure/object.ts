import type { ISerialInput, ISerialOutput } from '../io';
import type { ValueOrProvider } from '../utilityTypes';
import { STRING } from './baseTypes';
import {
    Schema, InferedProperties, SchemaProperties
} from './types';
import { SubTypeKey } from './types';


export class ObjectSchema<T extends SchemaProperties, O extends InferedProperties<T> = InferedProperties<T>> extends Schema<O> {
    constructor(public readonly properties: T) {
        super();
    }

    write(output: ISerialOutput, value: O): void {
        // Sorting the keys in ASCII ascending order, so that the order is platform independent.
        const keys: string[] = Object.keys(this.properties).sort();

        for (const key of keys) {
            this.properties[key].write(output, value[key]);
        }
    }

    read(input: ISerialInput): O {
        // Sorting the keys in ASCII ascending order, so that the order is platform independent.
        const keys: string[] = Object.keys(this.properties).sort();
        let result: any = {};

        for (const key of keys) {
            result[key] = this.properties[key].read(input);
        }

        return result;
    }

    sizeOf(value: O): number {
        let size = 0;

        // Going through the base properties
        size += Object.keys(this.properties)
                      .map(key => this.properties[key].sizeOf(value[key])) // Mapping properties into their sizes.
                      .reduce((a, b) => a + b); // Summing them up

        return size;
    }
}

type InferedSubTypes<T extends {[key in keyof T]: ObjectSchema<any>}> = {
    [Key in keyof T]: T[Key]['_infered'] & { type: Key }
};

export type ObjectSchemaMap<S, SI extends {[key in keyof SI]: SI[key]}> = {[key in keyof S]: ObjectSchema<SI[key]>};

export class GenericObjectSchema<
    T extends SchemaProperties, // Base properties
    S extends {[key in keyof S]: ObjectSchema<any>}, // Sub type map
    K extends (keyof S extends string ? SubTypeKey.STRING : SubTypeKey.ENUM)
> extends ObjectSchema<T, InferedProperties<T> & InferedSubTypes<S>[keyof S]> {
    constructor(
        public readonly keyedBy: K,
        properties: T,
        private readonly subTypeMap: ValueOrProvider<S>
    ) {
        super(properties);
    }

    private getSubTypeMap(): S {
        return typeof this.subTypeMap === 'function' ? this.subTypeMap() : this.subTypeMap;
    }

    write(output: ISerialOutput, value: InferedProperties<T> & InferedSubTypes<S>[keyof S]): void {
        // Figuring out sub-types
        const subTypeDescription = this.getSubTypeMap()[value.type] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${value.type}' in among '${JSON.stringify(Object.keys(this.subTypeMap))}'`);
        }

        // Writing the sub-type out.
        if (this.keyedBy === SubTypeKey.ENUM) {
            output.writeByte(value.type as number);
        }
        else {
            output.writeString(value.type as string);
        }

        // Writing the base properties
        super.write(output, value);

        // Extra sub-type fields
        const extraKeys: string[] = Object.keys(subTypeDescription.properties).sort();
    
        for (const key of extraKeys) {
            const prop = subTypeDescription.properties[key];
    
            prop.write(output, value[key]);
        }
    }

    read(input: ISerialInput): InferedProperties<T> & InferedSubTypes<S>[keyof S] {
        const subTypeMap = this.getSubTypeMap();
        const subTypeKey = this.keyedBy === SubTypeKey.ENUM ? input.readByte() : input.readString();

        const subTypeDescription = subTypeMap[subTypeKey as keyof S] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${subTypeKey}' in among '${JSON.stringify(Object.keys(subTypeMap))}'`);
        }

        let result: any = super.read(input);

        // Making the sub type key available to the result object.
        result.type = subTypeKey;

        if (subTypeDescription !== null) {
            const extraKeys: string[] = Object.keys(subTypeDescription.properties).sort();
        
            for (const key of extraKeys) {
                const prop = (subTypeDescription.properties)[key];
        
                result[key] = prop.read(input);
            }
        }

        return result;
    }

    sizeOf(value: InferedProperties<T> & InferedSubTypes<S>[keyof S]): number {
        let size = super.sizeOf(value);

        // We're a generic object trying to encode a concrete value.
        size += this.keyedBy === SubTypeKey.ENUM ? 1 : STRING.sizeOf(value.type as string);

        // Extra sub-type fields
        const subTypeDescription = this.getSubTypeMap()[value.type] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${value.type}' in among '${JSON.stringify(Object.keys(this.subTypeMap))}'`);
        }

        size += Object.keys(subTypeDescription.properties) // Going through extra property keys
                        .map(key => subTypeDescription.properties[key].sizeOf(value[key])) // Mapping extra properties into their sizes
                        .reduce((a, b) => a + b); // Summing them up
    
        return size;
    }
}
