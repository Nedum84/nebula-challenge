import { BadRequestError } from "../api-response";

const register = async (
  data: Pick<UserAttributes, "name" | "email" | "referee_code" | "signin_method"> &
    Partial<UserAttributes>
) => {
  // TODO
  await sendUserRegEmails(user as UserInstance & { created_at: Date });

  throw new BadRequestError("error herer");
  return user;
};

export const authService = {
  register,
};
