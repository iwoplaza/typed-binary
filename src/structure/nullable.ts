import type { ISerialInput, ISerialOutput } from '../io';
import type { NullableDescription, ReadContext, SizeContext, WriteContext } from './types';

export function readNullable<T extends NullableDescription>(ctx: ReadContext, input: ISerialInput, description: T): any {
    const valueExists = input.readBool();
    
    if (valueExists) {
        return ctx.readAny(description.elementType);
    }

    return undefined;
}

export function writeNullable<T extends NullableDescription>(ctx: WriteContext, output: ISerialOutput, description: T, value: any): void {
    if (value !== undefined && value !== null) {
        output.writeBool(true);
        ctx.writeAny(description.elementType, value);
    }
    else {
        output.writeBool(false);
    }
}

export function sizeOfNullable<T extends NullableDescription>(ctx: SizeContext, description: T, value: any): number {
    if (value === undefined)
        return 1;
    
    return 1 + ctx.sizeOfAny(description.elementType, value);
}
