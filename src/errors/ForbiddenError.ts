import CustomError from ".";

export default class ForbiddenError extends CustomError {
  private static readonly _statusCode = 403;
  private readonly _code: number;
  private readonly _logging: boolean;

  constructor(params?: { message?: string; logging?: boolean }) {
    const { message, logging } = params || {};

    super(message || "Forbidden");
    this._code = ForbiddenError._statusCode;
    this._logging = logging || false;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ForbiddenError.prototype);
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
