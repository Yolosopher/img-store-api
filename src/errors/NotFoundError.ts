import CustomError from ".";

export default class NotFoundError extends CustomError {
  private static readonly _statusCode = 404;
  private readonly _code: number;
  private readonly _logging: boolean;

  constructor(params?: { message?: string; logging?: boolean }) {
    const { message, logging } = params || {};

    super(message || "Not Found");
    this._code = NotFoundError._statusCode;
    this._logging = logging || false;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
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
