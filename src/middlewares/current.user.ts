import config from "../config/config";
import { NextFunction, Request, Response } from "express";
import { verify, VerifyErrors } from "jsonwebtoken";
import { isTest } from "../js-utils/env.utils";
import { base64 } from "../js-utils/encrypt";
import { UserContext, UserPayload } from "./auth.middleware";

/** Checks if token is set and appends the user object
 else continue with the request */
export const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader =
    req.headers["authorization"] || req.body?.auth_authorization || req.query.auth_authorization;
  const token = authHeader && authHeader.split(" ")[1];

  const deviceInfo = req.headers["device-info"] || req.body?.auth_device_info;

  if (deviceInfo) {
    req.appUser = {
      ...req.appUser,
      device: base64.decodeAndParse(deviceInfo as string),
      ...({} as UserPayload),
    };
  }

  if (!isTest()) {
    console.log("====>>>>>API_SOURCE<<<<<=====", req.appUser?.device?.device_type);
  }

  if (!token) return next();

  try {
    verify(token, config.jwt.secret, (err: VerifyErrors | null, data: any) => {
      if (!err) {
        req.appUser = {
          ...req.appUser,
          ...data.user,
          ip: req.ip,
        };
      }

      if (req.appUser) {
        // Set the user context
        UserContext.with(req.appUser, () => {
          next();
        });
      } else {
        next();
      }
    });
  } catch (error) {
    next();
  }
};
