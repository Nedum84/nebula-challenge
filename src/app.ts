import express, { Request, NextFunction, Response } from "express";
import { json } from "body-parser";
import "express-async-errors";
import config from "./config/config";
import path from "path";
import helmet from "helmet";
import morgan from "./config/morgan";
import fileUpload from "express-fileupload";
import { NotFoundError } from "./api-response";
import { errorHandler } from "./middlewares";
import { rateLimiter } from "./middlewares/rate.limiter";
import { authRoutes } from "./routes/auth.route";
import { leaderboardRoutes } from "./routes/leaderboard.route";

var xss = require("xss-clean");

const app = express();

app.use(json({ limit: "50mb" }));
app.use(fileUpload({}) as any);
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.set("trust proxy", true);

app.use(helmet());

app.use(xss());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    ["Origin", "Accept", "X-Requested-With", "Authorization", "Content-Type"].join(", ")
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.get("/", (req, res) => {
  return res.send("Hi There!");
});

app.use("/v1/auth", authRoutes);
app.use("/v1/leaderboard", leaderboardRoutes);

app.all("*", async (req, res) => {
  throw new NotFoundError(`Route[${req.method}::${req.url}] not found!`);
});
app.use(errorHandler);

export { app };
