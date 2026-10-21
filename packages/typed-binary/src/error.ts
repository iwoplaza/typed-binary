export class ValidationError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class InvalidSchemaShapeError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidSchemaShapeError.prototype);
  }
}
