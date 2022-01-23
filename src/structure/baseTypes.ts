import { TypeKey } from './_internal';

export type BaseType = TypeKey.BOOL | TypeKey.BYTE | TypeKey.INT | TypeKey.FLOAT | TypeKey.STRING;

export type BaseTypeMap = {
    [TypeKey.BOOL]: boolean,
    [TypeKey.BYTE]: number,
    [TypeKey.INT]: number,
    [TypeKey.FLOAT]: number,
    [TypeKey.STRING]: string,
};

export type BaseTypeDescription = {
    type: BaseType,
};
