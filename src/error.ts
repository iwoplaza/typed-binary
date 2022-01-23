export class TypedBinaryError extends Error {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, TypedBinaryError.prototype);
    }
}