import { Request, Response } from "express";
import { SuccessResponse } from "../api-response";
import { authService } from "../service/auth.service";

const register = async (req: Request, res: Response) => {
  const { name, email, preferred_username, password } = req.body;

  const result = await authService.register({ 
    name, 
    email, 
    preferred_username, 
    password 
  });

  SuccessResponse.created(res, result, result.message);
};

const confirmSignUp = async (req: Request, res: Response) => {
  const { email, confirmationCode } = req.body;

  const result = await authService.confirmSignUp(email, confirmationCode);

  SuccessResponse.ok(res, result, result.message);
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  SuccessResponse.ok(res, result, "Login successful");
};

const getProfile = async (req: Request, res: Response) => {
  // User details are already available from the auth middleware
  const user = req.cognitoUser;

  if (!user) {
    return SuccessResponse.ok(res, req.appUser, "Profile retrieved successfully");
  }

  SuccessResponse.ok(res, user, "Profile retrieved successfully");
};

export const authController = {
  register,
  confirmSignUp,
  login,
  getProfile,
};
