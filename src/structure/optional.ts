import type { ISerialInput, ISerialOutput } from '../io';
import { OptionalUndefined } from '../utilityTypes';
import { Schema } from './types';

export class OptionalSchema<T> extends Schema<T|undefined> {
    constructor(public readonly innerType: Schema<T>) {
        super();
    }

    write(output: ISerialOutput, value: OptionalUndefined<T|undefined>): void {
        if (value !== undefined && value !== null) {
            output.writeBool(true);
            this.innerType.write(output, value);
        }
        else {
            output.writeBool(false);
        }
    }

    read(input: ISerialInput): OptionalUndefined<T|undefined> {
        const valueExists = input.readBool();
    
        if (valueExists) {
            return this.innerType.read(input);
        }
    
        return undefined;
    }

    sizeOf(value: OptionalUndefined<T|undefined>): number {
        if (value === undefined)
            return 1;
    
        return 1 + this.innerType.sizeOf(value);
    }
}
