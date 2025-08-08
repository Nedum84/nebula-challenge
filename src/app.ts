import express, { Request, NextFunction, Response } from "express";
import { json } from "body-parser";
import "express-async-errors"; //To enable async on route function
import config from "./config/config";
import path from "path";
import helmet from "helmet";
import morgan from "./config/morgan";
import fileUpload from "express-fileupload";
import { NotFoundError } from "./api-response";
import { errorHandler } from "./middlewares";
// import { csrfRequest } from "./middlewares/csrf.request"; // Removed - module not found
import { rateLimiter } from "./middlewares/rate.limiter";
// import { isProd } from "./js-utils/env.utils"; // Removed - module not found
import { authRoutes } from "./routes/auth.route";
import { leaderboardRoutes } from "./routes/leaderboard.route";

var xss = require("xss-clean");

const app = express();

app.use(json({ limit: "50mb" })); // parse json request body
// app.use(express.json({ limit: "50mb" })); // parse json request body! (This works also)
// app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
// use express-fileupload
app.use(fileUpload({}) as any);
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.set("trust proxy", true);

// set security HTTP headers
app.use(helmet());

// sanitize request data
app.use(xss());
// app.use(rateLimiter.defaultLimiter); // Commented out until rate limiter is fixed

// enable cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    [
      "Origin",
      "Accept",
      "X-Requested-With",
      "Authorization",
      "Content-Type",
      "w-frsc",
      "-w-x-api-source", // remove later and also remove from admin/apps for avoid CORS
      "device-info",
    ].join(", ")
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.get("/", (req, res) => {
  return res.send("Hi There!");
});

// Routing....
app.use("/v1/auth", authRoutes);
app.use("/v1/leaderboard", leaderboardRoutes);

app.all("*", async (req, res) => {
  throw new NotFoundError(`Route[${req.method}::${req.url}] not found!`);
});
//Catch all Errors
app.use(errorHandler);

export { app };
