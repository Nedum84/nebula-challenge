import Joi from "joi";

const register = {
  body: Joi.object()
    .keys({
      name: Joi.string().required().min(2).max(100),
      email: Joi.string().email().required(),
    })
    .required(),
};

export const authValidation = {
  register,
};
