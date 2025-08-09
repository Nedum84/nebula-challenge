import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { CustomError } from "../api-response";
import { isObject, isString } from "lodash";

/**
 * Handles all the throwable errors and returns the standard response
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = httpStatus.BAD_REQUEST;


  const getErrorMessage = (() => {
    if (!isString(err.message) && isObject(err.message)) {
      const msg = err.message as any;
      const message = msg?.data?.message || msg?.data?.Message || msg?.statusText;
      if (message) return message;

      console.log("UNKOWN_ERROR", msg);
      return "Something went wrong. Try again";
    }
    return err.message;
  })();

  const lambdaResponseStream = (req as any).responseStream;
  // For Lambda Streaming
  if (lambdaResponseStream) {
    lambdaResponseStream.setContentType("text/event-stream");

    return lambdaResponseStream.end(
      `error: ${JSON.stringify({
        status: (err as any).statusCode || status,
        code: (err as any)?.errorCode || "BAD_REQUEST_ERROR",
        stack: err.stack,
        message: getErrorMessage ?? "Something went wrong.",
      })}\n\n`
    );
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({
      status: err.statusCode,
      code: err.errorCode,
      message: getErrorMessage,
      errors: err.errors ?? null,
      stack: err.stack,
    });
  }

  res.status(status).send({
    status,
    message: getErrorMessage ?? "Something went wrong.",
    stack: err.stack ?? "",
    code: "BAD_REQUEST_ERROR",
    errors: null,
  });
};
