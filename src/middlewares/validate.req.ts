import Joi, { ValidationOptions } from "joi";
import { Request, Response, NextFunction } from "express";
import { RequestValidationError } from "../api-response/request.validation.error";

const options: ValidationOptions = {
  abortEarly: false, // include all errors
  allowUnknown: false, // ignore unknown props
  stripUnknown: false, // remove unknown props
  errors: {
    label: "key", //defines the value used to set the label context variable.
  },
};

const validateReq = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema).validate(object, options);

  if (error) {
    return next(new RequestValidationError(error));
  }
  Object.assign(req, value);
  return next();
};
interface MapKey {
  [key: string]: string | undefined;
}
const pick = (object: any, keys: string[]) => {
  return keys.reduce((obj: MapKey, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

export { validateReq };
