import config from "../config/config";

const isTest = function () {
  return config.NODE_ENV === "test";
};
const isLocal = function () {
  return config.NODE_ENV === "local";
};
const isDev = function () {
  return config.NODE_ENV === "development" || config.NODE_ENV === "dev";
};
const isRelease = function () {
  return config.NODE_ENV === "release";
};
const isProd = function () {
  return config.NODE_ENV === "production" || config.NODE_ENV === "prod";
};

export { isTest, isLocal, isDev, isRelease, isProd };
