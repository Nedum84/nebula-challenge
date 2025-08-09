import httpStatus from "http-status";
import { Response } from "express";

export class SuccessResponse {
  static response = (
    res: Response,
    statusCode: number,
    payload?: Object,
    message?: string,
    extra = {},
    headers: Record<string, string> = {}
  ) => {
    const success =
      statusCode === httpStatus.OK || statusCode === httpStatus.CREATED ? true : false;


    Object.keys(headers).forEach((key) => {
      res.header(key, headers[key]);
    });
    res.status(statusCode).send({
      status: statusCode,
      success,
      message,
      data: payload,
      ...extra,
    });
  };

  static ok = (
    res: Response,
    payload?: Object,
    message?: string,
    headers: Record<string, string> = {}
  ) => {
    const msg = message ?? "success";
    const status: number = httpStatus.OK;
    return SuccessResponse.response(res, status, payload, msg, {}, headers);
  };

  static created = (
    res: Response,
    payload?: Object,
    message?: string,
    headers: Record<string, string> = {}
  ) => {
    const msg = message ?? "success";
    const status: number = httpStatus.CREATED;
    return SuccessResponse.response(res, status, payload, msg, {}, headers);
  };
}
