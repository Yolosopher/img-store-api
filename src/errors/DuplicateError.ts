import CustomError from ".";

export default class DuplicateError extends CustomError {
  private static readonly _statusCode = 409;
  private readonly _code: number;
  private readonly _logging: boolean;

  constructor(params?: { message?: string; logging?: boolean }) {
    const { message, logging } = params || {};

    super(message || "Duplicate Entry");
    this._code = DuplicateError._statusCode;
    this._logging = logging || false;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }

  get errors() {
    return [{ message: this.message }];
  }

  get statusCode() {
    return this._code;
  }

  get logging() {
    return this._logging;
  }
}
