export class ValidationError extends Error {
  constructor(message = 'Value does not match its schema') {
    super(message);
  }
}

export class InvalidSchemaShapeError extends Error {
  constructor(message = 'Invalid schema') {
    super(message);
  }
}
