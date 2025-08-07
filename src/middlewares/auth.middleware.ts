import { Request, Response, NextFunction } from "express";
import { verify, VerifyErrors } from "jsonwebtoken";
import moment from "moment";
import config from "../config/config";
import { UnauthorizedError } from "../api-response/unauthorized.error";
import { ForbiddenError } from "../api-response";
import { AsyncLocalStorage } from "async_hooks";

export interface UserPayload {
  /** Currect user_id */
  user_id: string;
  /** Currect user full legal name */
  name: string;
  email?: string;
  ip?: string;
  device?: {
    device_id?: string;
    device_type: "web" | "android" | "iphone" | "windows" | "mac";
    device_size: {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
    };
    device_name: string | undefined;
    device_model: string | undefined;
    device_manufacturer: string | undefined;
    device_info_type: string | undefined;
    device_os_name: string | undefined;
    device_os_version: string | undefined;
    timezone: string;
  };
}
export interface AdminPayload {
  admin_id: string;
  role_id: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      appUser?: UserPayload;
      admin?: AdminPayload;
    }
  }
}

const jwtExpiredMsg = "Your session has expired. Please sign in again to continue.";
/** Customer */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const requestPathname = decodeURI(`${req.baseUrl}${req.path}`.trim());
  const requestMethod = req.method.toLocaleLowerCase();
  //......
  const authHeader =
    req.headers["authorization"] || req.body?.auth_authorization || req.query.auth_authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    throw new UnauthorizedError("Unauthorized", "ERROR_INVALID_TOKEN");
  }

  const userId = req.appUser?.user_id;

  await verify(token, config.jwt.secret, async (err: VerifyErrors | null, data: any) => {
    let dateNow = moment().unix();
    let exp = data?.exp;

    if (err || dateNow > exp) {
      const msg = ["jwt expired", "jwt malformed"].includes(err?.message || "")
        ? jwtExpiredMsg
        : err?.message;

      throw new UnauthorizedError(msg ?? "Unauthorized", "ERROR_INVALID_TOKEN");
    }

    if (!data.user) {
      throw new UnauthorizedError("Auth user not found", "ERROR_NOT_FOUND_AUTH_DATA");
    }

    // NOTE: No use of array includes() because it's O(N) & not O(0)/constant
    if (
      requestMethod === "get" &&
      (requestPathname === "/v1/user/user/me" ||
        requestPathname === "/v1/mobile/user/me" ||
        requestPathname === "/v1/user/profile/profiles" ||
        requestPathname === "/v1/mobile/profile/profiles")
    ) {
      return next();
    }

    if (!userId) {
      throw new ForbiddenError(undefined, "USER_ACCOUNT_NOT_FOUND");
    }

    // TODO: Comment out userCache usage until module is available
    // const user = await userCache.findById(userId);
    // if (!user) {
    //   throw new ForbiddenError(undefined, "USER_ACCOUNT_NOT_FOUND");
    // }

    // // Check if account is disabled
    // if (user.disabled_at) {
    //   throw new BadRequestError("Your account is disabled!", "ACCOUNT_DISABLED");
    // }

    // // Check if account is suspended
    // const upsertMethods = ["post", "patch", "put", "delete"];

    // if (user.suspended_at && upsertMethods.includes(requestMethod)) {
    //   throw new BadRequestError(
    //     "Your account is suspended. Contact support",
    //     "ACCOUNT_PROFILE_SUSPENDED"
    //   );
    // }

    // req.appUser = {
    //   ...req.appUser,
    //   name: user.name,
    //   email: user.email,
    //   user_id: user.user_id,
    //   ip: req.ip,
    // } as UserPayload;

    if (req.appUser) {
      // Set the user context
      UserContext.with(req.appUser, () => {
        next();
      });
    } else {
      next();
    }
  });
};

export const requireAuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    throw new UnauthorizedError("Unauthorized", "ERROR_INVALID_TOKEN");
  }

  await verify(token, config.jwtAdmin.secret, async (err: VerifyErrors | null, data: any) => {
    let dateNow = moment().unix();
    let exp = data?.exp;

    if (err || dateNow > exp) {
      const msg = err?.message === "jwt expired" ? jwtExpiredMsg : err?.message;
      throw new UnauthorizedError(msg ?? "Unauthorized", "ERROR_INVALID_TOKEN");
    }

    if (!data.admin) {
      throw new UnauthorizedError("Admin auth user not found", "ERROR_NOT_FOUND_AUTH_DATA");
    }

    // const suspendRedisKey = adminSuspendedRedisKey(data.admin.admin_id);
    // const isSuspended = await redisService.get<Date>(suspendRedisKey);

    // if (isSuspended) {
    //   throw new BadRequestError("Your account has been disabled. Contact Administrator.");
    // }

    if (data.admin) {
      req.admin = data.admin;
    }
    next();
  });
};

// Create the UserContext using AsyncLocalStorage
export const UserContext = (() => {
  const storage = new AsyncLocalStorage<UserPayload | null>();

  return {
    /**
     * Retrieves the current user context.
     */
    use(): UserPayload | null {
      return storage.getStore() || null;
    },

    /**
     * Runs a function with a specific user context.
     * @param user - The user object to set as the current context.
     * @param fn - The function to execute within the context.
     */
    with<T>(user: UserPayload | null, fn: () => T): T {
      return storage.run(user, fn);
    },
  };
})();
