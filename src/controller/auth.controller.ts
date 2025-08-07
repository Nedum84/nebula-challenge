import { Request, Response } from "express";
import { SuccessResponse } from "../../api-response";
import { UserAttributes } from "../model";
import { userService } from "../service";
import { userUserMeta } from "../../js-utils/user.meta.utils";

const register = async (req: Request, res: Response) => {
  const { user_id: user_id } = req.appUser!;
  const body: UserAttributes = req.body;

  const result = await userService.update({ user_id, body }, { meta: userUserMeta(req) });

  SuccessResponse.ok(res, result);
};

export const authController = {
  register,
};
