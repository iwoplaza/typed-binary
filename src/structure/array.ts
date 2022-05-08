import type { ISerialInput, ISerialOutput } from '../io';
import { INT } from './baseTypes';
import { IRefResolver, ISchema, IStableSchema, Schema } from './types';


export class ArraySchema<T> extends Schema<T[]> {
    public elementType: IStableSchema<T>

    constructor(private readonly _unstableElementType: ISchema<T>) {
        super();

        // In case this array isn't part of a keyed chain,
        // let's assume the inner type is stable.
        this.elementType = _unstableElementType as IStableSchema<T>;
    }

    resolve(ctx: IRefResolver): void {
        this.elementType = ctx.resolve(this._unstableElementType);
    }

    write(output: ISerialOutput, values: T[]): void {
        output.writeInt(values.length);

        for (const value of values) {
            this.elementType.write(output, value);
        }
    }

    read(input: ISerialInput): T[] {
        const array = [];

        const len = input.readInt();
    
        for (let i = 0; i < len; ++i) {
            array.push(this.elementType.read(input));
        }
    
        return array;
    }

    sizeOf(values: T[]): number {
        // Length encoding
        let size = INT.sizeOf();
        // Values encoding
        size += values.map((v) => this.elementType.sizeOf(v)).reduce((a, b) => a + b, 0);
    
        return size;
    }
}
