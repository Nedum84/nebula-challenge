import { Request, Response } from "express";
import { SuccessResponse } from "../api-response";
import { authService } from "../service/auth.service";

const register = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const result = await authService.register({ name, email });

  SuccessResponse.created(res, result, "Registration successful");
};

export const authController = {
  register,
};
