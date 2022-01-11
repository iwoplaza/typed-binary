import { BaseType } from './structure/baseTypes';
import { CompoundType } from './structure/compoundTypes';

export const PROP_BOOL =        { type: BaseType.BOOL as const };
export const PROP_BYTE =        { type: BaseType.BYTE as const };
export const PROP_INT =         { type: BaseType.INT as const };
export const PROP_FLOAT =       { type: BaseType.FLOAT as const };
export const PROP_STRING =      { type: BaseType.STRING as const };
export const PROP_CHARS =       { type: BaseType.CHARS as const };
export const PROP_OBJ =         { type: CompoundType.OBJECT as const };
export const PROP_ARRAY =       { type: CompoundType.ARRAY as const };
export const PROP_NULLABLE =    { type: CompoundType.NULLABLE as const };