import { Request, Response } from "express";
import { SuccessResponse } from "../api-response";
import { authService } from "../service/auth.service";

const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = await authService.register({ name, email, password });

  SuccessResponse.created(res, result, "Registration successful");
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  SuccessResponse.ok(res, result, "Login successful");
};

const getProfile = async (req: Request, res: Response) => {
  const userId = req.appUser?.user_id;

  const result = await authService.getProfile(userId!);

  SuccessResponse.ok(res, result, "Profile retrieved successfully");
};

export const authController = {
  register,
  login,
  getProfile,
};
