import Joi from "joi";

const register = {
  body: Joi.object()
    .keys({
      name: Joi.string().custom(fullName),
      email: Joi.string().email(),
    })
    .min(1),
};

export const authValidation = {
  register,
};
