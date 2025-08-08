import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../api-response";
import { AsyncLocalStorage } from "async_hooks";
import { authService, CognitoUser } from "../service/auth.service";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is required");
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new UnauthorizedError("Bearer token is required");
    }

    // Verify Cognito access token and get user details
    const user = await authService.verifyAccessToken(accessToken);

    
    // Set the user context and continue
    CognitoUserContext.with(user, () => {
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Optional middleware for routes that can work with or without authentication
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
      // Try to verify token, but don't fail if it's invalid
      const user = await authService.verifyAccessToken(accessToken);

      
      // Set the user context and continue
      CognitoUserContext.with(user, () => {
        next();
      });
    } catch (error) {
      // Ignore token verification errors for optional auth
      console.log("Optional auth failed:", error);
      next();
    }
  } catch (error) {
    next();
  }
};

// Create the UserContext using AsyncLocalStorage
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
