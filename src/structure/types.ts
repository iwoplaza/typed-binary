import { ISerialInput, ISerialOutput } from '../io';

export interface ISchema<P> {
    /**
     * Used as a type holder, so that type inference works correctly.
     */
    readonly _infered: P;
}

export abstract class Schema<P> implements ISchema<P> {
    /**
     * Used as a type holder, so that type inference works correctly.
     */
    readonly _infered!: P;
    
    abstract write(output: ISerialOutput, value: P): void;
    abstract read(input: ISerialInput): P;
    abstract sizeOf(value: P): number;
}

////
// CONTEXT
////

export enum SubTypeKey {
    STRING = 'STRING',
    ENUM = 'ENUM',
}

export type SchemaProperties = {[key: string]: Schema<any>};
export type InferedProperties<T extends {[key: string]: Schema<any>}> = {[key in keyof T]: T[key]['_infered']};

export interface IConcreteObjectSchema<T extends SchemaProperties> extends ISchema<InferedProperties<T>> {
    readonly properties: T;
}
