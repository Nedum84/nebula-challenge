import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../api-response";
import { authService } from "../service/auth.service";

export interface UserPayload {
  user_id: string;
  name?: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      appUser?: UserPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is required");
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      throw new UnauthorizedError("Bearer token is required");
    }

    // Verify token
    const decoded = await authService.verifyToken(token);
    
    // Get user details
    const user = await authService.getProfile(decoded.user_id);
    
    // Set user in request
    req.appUser = {
      user_id: decoded.user_id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Legacy exports for compatibility
export const requireAuth = authMiddleware;
