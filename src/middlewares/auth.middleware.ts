import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../api-response";
import { AsyncLocalStorage } from "async_hooks";
import { authService, CognitoUser } from "../service/auth.service";


export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is required");
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new UnauthorizedError("Bearer token is required");
    }

    const user = await authService.verifyAccessToken(accessToken);

    
    CognitoUserContext.with(user, () => {
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return next();
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return next();
    }

    try {
      const user = await authService.verifyAccessToken(accessToken);

      
        CognitoUserContext.with(user, () => {
        next();
      });
    } catch (error) {
      console.log("Optional auth failed:", error);
      next();
    }
  } catch (error) {
    next();
  }
};

export const CognitoUserContext = (() => {
  const storage = new AsyncLocalStorage<CognitoUser | null>();

  return {
    /**
     * Retrieves the current user context.
     */
    use(): CognitoUser | null {
      return storage.getStore() || null;
    },

    /**
     * Runs a function with a specific user context.
     * @param user - The user object to set as the current context.
     * @param fn - The function to execute within the context.
     */
    with<T>(user: CognitoUser | null, fn: () => T): T {
      return storage.run(user, fn);
    },
  };
})();
