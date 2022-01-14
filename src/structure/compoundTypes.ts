import { ISerialInput, ISerialOutput } from '../io';
import { Parsed } from '../parsed';
import { BaseType, BaseTypeDescription, readBaseType, writeBaseType } from './baseTypes';

export enum CompoundType {
    NULLABLE = 'NULLABLE',
    OBJECT = 'OBJECT',
    ARRAY = 'ARRAY',
}

export type PropertyDescription = ObjectDescription | ArrayDescription | NullableDescription | BaseTypeDescription;

export type ObjectDescription = {
    type: CompoundType.OBJECT,
    subTypeCategory?: string,
    subType?: string | number,
    /**
     * @default SubTypeKey.STRING
     */
    keyedBy?: SubTypeKey,
    properties: {
        [key: string]: PropertyDescription,
    },
}

export type ArrayDescription = {
    type: CompoundType.ARRAY,
    elementType: PropertyDescription,
}

export type NullableDescription = {
    type: CompoundType.NULLABLE,
    element: PropertyDescription,
}

/**
 * Sub Types
 */

export type SubTypeCategory = {[key: string]: ObjectDescription};

export interface ISubTypeContext {
    [key: string]: SubTypeCategory;
}

export enum SubTypeKey {
    STRING = 'STRING',
    ENUM = 'ENUM',
}

/**
 * IO
 */

export function readSerial<T extends PropertyDescription, C extends ISubTypeContext>(subTypeContext: C, input: ISerialInput, description: T): Parsed<T, C> {
    if (description.type === CompoundType.OBJECT) {
        // @ts-ignore
        return readObject(subTypeContext, input, description);
    }
    else if (description.type === CompoundType.ARRAY) {
        // @ts-ignore
        return readArray(subTypeContext, input, description);
    }
    else if (description.type === CompoundType.NULLABLE) {
        // @ts-ignore
        return readNullable(subTypeContext, input, description);
    }
    else if (description.type === BaseType.CHARS) {
        // @ts-ignore
        return readChars(input, description);
    }
    else {
        // @ts-ignore
        return readBaseType(input, description);
    }
}

export function readNullable<T extends NullableDescription, C extends ISubTypeContext>(subTypeContext: C, input: ISerialInput, description: T): Parsed<T, C> {
    const valueExists = input.readBool();
    
    if (valueExists) {
        // @ts-ignore
        return readSerial(subTypeContext, input, description.element);
    }

    return undefined as any;
}

export function readArray<T extends ArrayDescription, C extends ISubTypeContext>(subTypeContext: C, input: ISerialInput, arrayType: T): Parsed<T, C> {
    const array: Parsed<T, C> = [] as any;

    const len = input.readInt();

    // @ts-ignore
    for (let i = 0; i < len; ++i) {
        array.push(readSerial(subTypeContext, input, arrayType.elementType));
    }

    return array;
}

export function readObject<T extends ObjectDescription, C extends ISubTypeContext>(subTypeContext: C, input: ISerialInput, description: T): Parsed<T, C> {
    const keys: string[] = Object.keys(description.properties);
    let result: any = {};

    let subTypeDescription: ObjectDescription|null = null;

    if (description.subTypeCategory !== undefined) {
        const subTypeCategory = subTypeContext[description.subTypeCategory];
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

        // @ts-ignore
        result[key] = readSerial(subTypeContext, input, obj);
    }

    if (subTypeDescription !== null) {
        const extraKeys: string[] = Object.keys(subTypeDescription.properties);
    
        for (const key of extraKeys) {
            const prop = (subTypeDescription.properties)[key];
    
            result[key] = readSerial(subTypeContext, input, prop);
        }
    }

    return result;
}


export function writeSerial<T extends PropertyDescription, C extends ISubTypeContext>(subTypeContext: C, output: ISerialOutput, description: T, value: Parsed<T, C>) {
    if (description.type === CompoundType.OBJECT) {
        // @ts-ignore
        writeObject(subTypeContext, output, description, value);
    }
    else if (description.type === CompoundType.ARRAY) {
        // @ts-ignore
        writeArray(subTypeContext, output, description, value);
    }
    else if (description.type === CompoundType.NULLABLE) {
        // @ts-ignore
        writeNullable(subTypeContext, output, description, value);
    }
    else if (description.type === BaseType.CHARS) {
        // @ts-ignore
        writeChars(output, description, value);
    }
    else {
        // @ts-ignore
        writeBaseType(output, description, value);
    }
}

export function writeNullable<T extends NullableDescription, C extends ISubTypeContext>(subTypeContext: C, output: ISerialOutput, description: T, value: Parsed<T, C>): void {
    // @ts-ignore
    if (value !== undefined && value !== null) {
        output.writeBool(true);
        // @ts-ignore
        writeSerial(subTypeContext, output, description.element, value);
    }
    else {
        output.writeBool(false);
    }
}

export function writeArray<T extends ArrayDescription, C extends ISubTypeContext>(subTypeContext: C, output: ISerialOutput, arrayType: T, values: Parsed<T, C>): void {
    // @ts-ignore
    output.writeInt(values.length);

    for (const value of values) {
        // @ts-ignore
        writeSerial(subTypeContext, output, arrayType.elementType, value);
    }
}

export function writeObject<T extends ObjectDescription, C extends ISubTypeContext>(subTypeContext: ISubTypeContext, output: ISerialOutput, description: T, value: Parsed<T, C>): void {
    const keys: string[] = Object.keys(description.properties);

    // Figuring out sub-types
    let subTypeDescription: ObjectDescription | null = null;

    if (description.subTypeCategory !== undefined) {
        const category = subTypeContext[description.subTypeCategory];

        if (category === undefined) {
            throw new Error(`Unknown sub-type category: '${description.subTypeCategory}'`);
        }

        // @ts-ignore
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
        
        // @ts-ignore
        writeSerial(subTypeContext, output, propDescription, value[key]);
    }

    // Extra sub-type fields
    if (subTypeDescription !== null) {
        const extraKeys: string[] = Object.keys(subTypeDescription.properties);
    
        for (const key of extraKeys) {
            const prop = (subTypeDescription.properties)[key];
    
            writeSerial(subTypeContext, output, prop, value[key]);
        }
    }
}