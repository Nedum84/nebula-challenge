import httpStatus from "http-status";
import { CustomError } from ".";

export class NotFoundError extends CustomError {
  statusCode = httpStatus.NOT_FOUND;

  constructor(public message: string = "Not found", public errorCode = "NOT_FOUND_ERROR") {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
