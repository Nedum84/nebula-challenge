import Joi from "joi";

const register = {
  body: Joi.object()
    .keys({
      name: Joi.string().required().min(2).max(100).trim(),
      email: Joi.string().email().required().lowercase().trim(),
      password: Joi.string()
        .required()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .message('Password must contain at least 8 characters, including uppercase, lowercase, and number'),
    })
    .required(),
};

const login = {
  body: Joi.object()
    .keys({
      email: Joi.string().email().required().lowercase().trim(),
      password: Joi.string().required(),
    })
    .required(),
};

export const authValidation = {
  register,
  login,
};
