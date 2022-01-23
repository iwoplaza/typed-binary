import { Parsed } from './parsed';
import { sizeOf } from './structure';
import type { ISubTypeContext, TypeDescription } from './structure';

class Helper<T extends TypeDescription> {
    constructor(private readonly description: T) {}

    sizeOf<C extends ISubTypeContext = {}>(value: Parsed<T, C>, ctx?: C): number {
        // @ts-ignore
        return sizeOf<T, C>(this.description, value, ctx);
    }
}

export function helperFor<T extends TypeDescription>(description: T) {
    return new Helper<T>(description);
}