export class ValidationError extends Error {
  constructor(msg = 'Value does not match its schema') {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class InvalidSchemaShapeError extends Error {
  constructor(msg = 'Invalid schema') {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidSchemaShapeError.prototype);
  }
}
