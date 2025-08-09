import { Request, Response } from "express";
import { SuccessResponse } from "../api-response";
import { authService } from "../service/auth.service";
import { CognitoUserContext } from "../middlewares/auth.middleware";

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
  const user = CognitoUserContext.use();

  if (!user) {
    throw new Error("User not found in context");
  }

  SuccessResponse.ok(res, user, "Profile retrieved successfully");
};

export const authController = {
  register,
  confirmSignUp,
  login,
  getProfile,
};
