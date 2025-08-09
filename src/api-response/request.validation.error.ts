import { ValidationError } from "joi";
import httpStatus from "http-status";
import { CustomError } from ".";

export class RequestValidationError extends CustomError {
  statusCode = httpStatus.BAD_REQUEST;

  constructor(
    public error: ValidationError | CustomValidationError,
    public errorCode = "VALIDATION_ERROR"
  ) {
    super(error.message ?? "Invalid request parameters");
    if (this.error instanceof ValidationError) {
      this.errors = this.error.details?.map((err) => {
        return { message: err.message, field: err.context?.key };
      });
    } else {
      this.errors = (this.error as CustomValidationError).errors;
    }

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}

class CustomValidationError {
  message!: string;
  errors!: { message: string; field: string }[];
}
