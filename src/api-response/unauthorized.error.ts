import httpStatus from "http-status";
import { CustomError } from ".";

export class UnauthorizedError extends CustomError {
  statusCode = httpStatus.UNAUTHORIZED;

  constructor(
    public message = "Unauthorized for this action",
    public errorCode = "UNAUTHORIZED_ERROR"
  ) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
