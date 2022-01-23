import type { ISerialInput, ISerialOutput } from '../io';
import { STRING } from '../describe';
import type {
    ObjectDescription, ConcreteObjectDescription,
    ReadContext, WriteContext, SizeContext
} from './types';
import { SubTypeKey } from './types';


/*
* IO
*/

export function readObject<T extends ObjectDescription>(ctx: ReadContext, input: ISerialInput, description: T): any {
    // Sorting the keys in ASCII ascending order, so that the order is platform independent.
    const keys: string[] = Object.keys(description.properties).sort();
    let result: any = {};

    let subTypeDescription: ObjectDescription|null = null;

    if ('subTypeCategory' in description) {
        const subTypeCategory = ctx.subTypes[description.subTypeCategory];
        if (subTypeCategory === undefined) {
            throw new Error(`Unknown sub-type category: '${description.subTypeCategory}'`);
        }

        const subTypeKey = description.keyedBy === SubTypeKey.ENUM ? input.readByte() : input.readString();
        subTypeDescription = subTypeCategory[subTypeKey] || null;
        
        // Making the sub type key available to the result object.
        result.subType = subTypeKey;

        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${subTypeKey}' in '${description.subTypeCategory}' category`);
        }
    }

    for (const key of keys) {
        const obj = (description.properties)[key];

        result[key] = ctx.readAny(obj);
    }

    if (subTypeDescription !== null) {
        const extraKeys: string[] = Object.keys(subTypeDescription.properties).sort();
    
        for (const key of extraKeys) {
            const prop = (subTypeDescription.properties)[key];
    
            result[key] = ctx.readAny(prop);
        }
    }

    return result;
}

export function writeObject<T extends ObjectDescription>(ctx: WriteContext, output: ISerialOutput, description: T, value: any): void {
    // Sorting the keys in ASCII ascending order, so that the order is platform independent.
    const keys: string[] = Object.keys(description.properties).sort();

    // Figuring out sub-types
    let subTypeDescription: ConcreteObjectDescription | null = null;

    if ('subTypeCategory' in description) {
        const category = ctx.subTypes[description.subTypeCategory];

        if (category === undefined) {
            throw new Error(`Unknown sub-type category: '${description.subTypeCategory}'`);
        }

        subTypeDescription = category[value.subType] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${value.subType}' in '${description.subTypeCategory}' category`);
        }

        // Writing the sub-type out.
        if (description.keyedBy === SubTypeKey.ENUM) {
            output.writeByte(value.subType);
        }
        else {
            output.writeString(value.subType);
        }
    }

    for (const key of keys) {
        const propDescription = (description.properties)[key];
        
        ctx.writeAny(propDescription, value[key]);
    }

    // Extra sub-type fields
    if (subTypeDescription !== null) {
        const extraKeys: string[] = Object.keys(subTypeDescription.properties).sort();
    
        for (const key of extraKeys) {
            const prop = (subTypeDescription.properties)[key];
    
            ctx.writeAny(prop, value[key]);
        }
    }
}

export function sizeOfObject<T extends ObjectDescription>(ctx: SizeContext, description: T, value: any): number {
    let size = 0;

    // Going through the base properties
    size += Object.keys(description.properties)
                  .map(key => ctx.sizeOfAny(description.properties[key], value[key])) // Mapping properties into their sizes.
                  .reduce((a, b) => a + b); // Summing them up

    if ('subTypeCategory' in description) {
        // We're a generic object trying to encode a concrete value.
        const subType: string = (value as any).subType;

        size += description.keyedBy === SubTypeKey.ENUM ? 1 : ctx.sizeOfAny(STRING, subType);

        const category = ctx.subTypes[description.subTypeCategory];
        if (category === undefined) {
            throw new Error(`Unknown sub-type category: '${description.subTypeCategory}'`);
        }

        // Extra sub-type fields
        const subTypeDescription = category[subType] || null;
        if (subTypeDescription === null) {
            throw new Error(`Unknown sub-type '${subType}' in '${description.subTypeCategory}' category`);
        }

        size += Object.keys(subTypeDescription.properties) // Going through extra property keys
                        .map(key => ctx.sizeOfAny(subTypeDescription.properties[key], (value as any)[key])) // Mapping extra properties into their sizes
                        .reduce((a, b) => a + b); // Summing them up
    }

    return size;
}