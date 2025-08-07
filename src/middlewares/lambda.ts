import { getCurrentInvoke } from "@codegenie/serverless-express";
import { Request, Response, NextFunction } from "express";
import { LambdaResponseStream } from "../aws/types";

declare global {
  namespace Express {
    interface Request {
      responseStream?: LambdaResponseStream;
    }
  }
}

export const bindResponseStreamToRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { event, context } = getCurrentInvoke();

  req.responseStream = event?.responseStream || context?.responseStream;
  next();
};
