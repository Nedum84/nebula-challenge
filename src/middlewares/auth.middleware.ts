import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../api-response";
import { authService } from "../service/auth.service";
import { CognitoUser } from "../service/cognito.service";

export interface UserPayload {
  user_id: string;
  name: string;
  email: string;
  preferred_username: string;
  email_verified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      appUser?: UserPayload;
      cognitoUser?: CognitoUser;
    }
  }
}

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
    
    // Set user in request for compatibility
    req.appUser = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      preferred_username: user.preferred_username,
      email_verified: user.email_verified,
    };

    // Also set the full Cognito user object
    req.cognitoUser = user;

    next();
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
      
      req.appUser = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        preferred_username: user.preferred_username,
        email_verified: user.email_verified,
      };

      req.cognitoUser = user;
    } catch (error) {
      // Ignore token verification errors for optional auth
      console.log("Optional auth failed:", error);
    }

    next();
  } catch (error) {
    next();
  }
};

// Legacy exports for compatibility
export const requireAuth = authMiddleware;
