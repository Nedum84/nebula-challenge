import { Options, rateLimit, ValueDeterminingMiddleware, ipKeyGenerator } from "express-rate-limit";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../api-response";
import httpStatus from "http-status";
// TODO: Missing import - comment out until module is available
// import { isLocal } from "../js-utils/env.utils";
import * as jwt from "jsonwebtoken";
import config from "../config/config";
import { UserPayload } from "./auth.middleware";

const defaultLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  // TODO: Comment out until isLocal is available - using default limit
  limit: 50, // TODO change to 100 later (was: isLocal() ? 10000 : 50)
  //   skipSuccessfulRequests: true, //
  keyGenerator: limiterKeyGenerator,
  handler: function (req, res) {
    throw new BadRequestError(
      "You sent too many requests. Please wait a while then try again!",
      "TOO_MANY_REQUEST",
      httpStatus.TOO_MANY_REQUESTS
    );
    // return res.status(429).json({
    //   error: 'You sent too many requests. Please wait a while then try again'
    // })
  },
});

const signatureGenerate = (req: Request, res: Response, next: NextFunction) => {
  // Request-specific data
  const { method, ip } = req;
  const { headers } = req;
  const token = headers.authorization || "";

  // Combine data to create a unique signature
  const signatureData = `${ip}${method}${token}`.trim();

  // Generate a hash of the signature data
  const signature = crypto.createHash("md5").update(signatureData).digest("hex");
  // Attach the signature to the request object for later use
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
  // const deviceInfo = req.headers["device-info"] || req.body?.auth_device_info;;
  const token = authHeader && authHeader.split(" ")[1];

  try {
    if (token) {
      const payload = jwt.verify(token, config.jwt.secret) as any;
      if (payload) {
        const appUser = payload.user as UserPayload;

        // return `${profileId}`;
        // return `${appUser.user_id}_${deviceInfo}`;
        return `${appUser.user_id}`;
      }
    }
  } catch (error) {}

  // Use the official IPv6-safe key generator from express-rate-limit
  return ipKeyGenerator(req.ip || req.connection?.remoteAddress || '127.0.0.1');
}

export const rateLimiter = {
  defaultLimiter,
  custom,
};
