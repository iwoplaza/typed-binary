import { ISerialInput, ISerialOutput } from '../io';
import { OptionalUndefined } from '../utilityTypes';

export interface ISchema<P> {
    /**
     * Used as a type holder, so that type inference works correctly.
     */
    readonly _infered: P;

    write(output: ISerialOutput, value: OptionalUndefined<P>): void;
    read(input: ISerialInput): OptionalUndefined<P>;
    sizeOf(value: OptionalUndefined<P>): number;
}

export abstract class Schema<P> implements ISchema<P> {
    /**
     * Used as a type holder, so that type inference works correctly.
     */
    readonly _infered!: P;
    
    abstract write(output: ISerialOutput, value: OptionalUndefined<P>): void;
    abstract read(input: ISerialInput): OptionalUndefined<P>;
    abstract sizeOf(value: OptionalUndefined<P>): number;
}

////
// CONTEXT
////

export enum SubTypeKey {
    STRING = 'STRING',
    ENUM = 'ENUM',
}

// export type SchemaProperties<T> = T extends {[key in keyof T]: Schema<any>} ? {[key in keyof T]: Schema<T[key]['_infered']>} : never;
export type SchemaProperties = {[key: string]: Schema<unknown>};
export type InferedProperties<T extends {[key: string]: Schema<unknown>}> = {[key in keyof T]: T[key]['_infered']};

export interface IConcreteObjectSchema<T extends SchemaProperties> extends ISchema<InferedProperties<T>> {
    readonly properties: T;
}
