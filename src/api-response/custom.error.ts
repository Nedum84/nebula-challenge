export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract errorCode: string;
  public errors?: any[];

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
