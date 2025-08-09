"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Callback,
  Context,
  Handler,
} from "aws-lambda";
import awsServerlessExpress from "aws-serverless-express";
import { app } from "../app";
import { lamdaCliHandler } from "./aws.cmd";
import { getLambdaEventSource } from "./lambda.event.source";
import { awsS3 } from "../aws-events/aws.s3";
import { awsSqs } from "../aws-events/aws.sqs";
import { awsSns } from "../aws-events/aws.sns";
import { awsEventScheduler } from "../aws-events/aws.schedular";

import codegenieServerlessExpress from "@codegenie/serverless-express";
import { LambdaResponseStream } from "./types";

const server =
  process.env.USE_CODEGENIE_FOR_EXPRESS !== "true" ? awsServerlessExpress.createServer(app) : null;

const expressApp: APIGatewayProxyHandler = (
  event: APIGatewayProxyEvent & { rawPath: string },
  context: Context,
  callback
) => {
  if (process.env.USE_CODEGENIE_FOR_EXPRESS === "true") {
    return codegenieServerlessExpress({ app, resolutionMode: "PROMISE" })(event, context, callback);
  }
  {
    awsServerlessExpress.proxy(server!, event, context);
  }
};

const functionUrlStreamHandler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent & { rawPath: string },
    responseStream: LambdaResponseStream,
    context: Context
  ) => {
    return functionUrlStream(event, responseStream, context);
  }
);
const functionUrlStream = async (
  event: APIGatewayProxyEvent & { rawPath: string },
  responseStream: LambdaResponseStream,
  context: Context
) => {
  const method = (event.requestContext as any)?.http?.method;

  if (event.requestContext && "http" in event.requestContext) {
    const path = event.rawPath || "";
    console.log("Original path:", path);

    if (!path.startsWith("/v1") && path !== "/") {
      event.rawPath = `/v1${path}`;
      event.path = `/v1${path}`;
    }
  }
  (event as any).responseStream = responseStream;
  (context as any).responseStream = responseStream;

  try {
    const handler = codegenieServerlessExpress({ app });
    await handler(event, context, {} as any);
  } catch (error) {
    console.error("Error in functionUrl handler:", error);
    throw error;
  }
};

const functionUrlApp: Handler = async (
  event: APIGatewayProxyEvent & { rawPath: string },
  context: Context,
  callback
) => {
  if (event.requestContext && "http" in event.requestContext) {
    const path = event.rawPath || "";
    console.log("Original path:", path);

    if (!path.startsWith("/v1") && path !== "/") {
      event.rawPath = `/v1${path}`;
      event.path = `/v1${path}`;
    }
  }

  try {
    const handler = codegenieServerlessExpress({ app });
    const response = await handler(event, context, callback);

    if (response && response.body && typeof response.body === "string") {
      try {
        const parsedBody = JSON.parse(response.body);
        return parsedBody;
      } catch (e) {
        console.error("Error parsing response body:", e);
        return response;
      }
    }

    return response;
  } catch (error) {
    console.error("Error in functionUrl handler:", error);
    throw error;
  }
};

const router = (
  source: ReturnType<typeof getLambdaEventSource>,
  event: any,
  context: any,
  callback: any
) => {
  console.info("Event-Source:", source);
  switch (source) {
    case "isS3":
      return awsS3.lambdaHandler(event, context);
    case "isSqs":
      return awsSqs.lambdaHandler(event, context);
    case "isSns":
      return awsSns.lambdaHandler(event, context);
    case "isCmd":
      return lamdaCliHandler(event, context, callback);
    case "isApiGateway":
      return expressApp(event, context, callback);
    case "isFuntionUrl":
      return functionUrlApp(event, context, callback);
    case "isEventScheduler":
      return awsEventScheduler.lambdaHandler(event, context);
    default:
      console.error("Unsupported event source", event);
  }
};

const handler: Handler = (
  event: APIGatewayProxyEvent & {
    responseStream: LambdaResponseStream;
    rawPath: string;
  },
  context: Context & { responseStream: LambdaResponseStream },
  callback: Callback<APIGatewayProxyResult>
) => {
  const source = getLambdaEventSource(event);

  try {
    return router(source, event, context, callback);
  } finally {
  }
};

export = {
  handler,
  functionUrlStreamHandler,
};
