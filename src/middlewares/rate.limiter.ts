import { Options, rateLimit, ValueDeterminingMiddleware, ipKeyGenerator } from "express-rate-limit";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../api-response";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import config from "../config/config";
import { CognitoUserContext } from "./auth.middleware";

const defaultLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 50, // TODO change to 100 later (was: isLocal() ? 10000 : 50)
  keyGenerator: limiterKeyGenerator,
  handler: function (req, res) {
    throw new BadRequestError(
      "You sent too many requests. Please wait a while then try again!",
      "TOO_MANY_REQUEST",
      httpStatus.TOO_MANY_REQUESTS
    );
  },
});

const signatureGenerate = (req: Request, res: Response, next: NextFunction) => {
  const { method, ip } = req;
  const { headers } = req;
  const token = headers.authorization || "";

  const signatureData = `${ip}${method}${token}`.trim();

  const signature = crypto.createHash("md5").update(signatureData).digest("hex");
  (req as any).requestSignature = signature;

  next();
};

function custom(limit = 20, windowMs = 2 * 60 * 1000, options?: Partial<Options>) {
  return rateLimit({
    windowMs,
    limit,
    ...options,
    keyGenerator: limiterKeyGenerator,
    handler: function (req, res) {
      throw new BadRequestError(
        options?.message || "You sent too many requests. Please wait a while then try again",
        "TOO_MANY_REQUEST",
        httpStatus.TOO_MANY_REQUESTS
      );
    },
  });
}

function limiterKeyGenerator(req: Request, res: Response): string {
  const authHeader =
    req.headers["authorization"] || req.body?.auth_authorization || req.query.auth_authorization;
  const token = authHeader && authHeader.split(" ")[1];

  try {
    if (token) {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.sub) {
        return `${decoded.sub}`;
      }
    }
  } catch (error) {}

  return ipKeyGenerator(req.ip || req.connection?.remoteAddress || '127.0.0.1');
}

export const rateLimiter = {
  defaultLimiter,
  custom,
};
