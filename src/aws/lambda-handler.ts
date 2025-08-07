"use strict";
// import serverlessHttp from 'serverless-http';
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
import { isProd } from "../js-utils/env.utils";
import { LambdaResponseStream } from "./types";

// const server = awsServerlessExpress.createServer(app);

// Only create the server if you're actually using aws-serverless-express
const server =
  process.env.USE_CODEGENIE_FOR_EXPRESS !== "true" ? awsServerlessExpress.createServer(app) : null;

const expressApp: APIGatewayProxyHandler = (
  event: APIGatewayProxyEvent & { rawPath: string },
  context: Context,
  callback
) => {
  if (process.env.USE_CODEGENIE_FOR_EXPRESS === "true") {
    // --> codegenie Serverless -> doesn't work well with api gateway REST, works well with api gateway HTTP Api
    return codegenieServerlessExpress({ app, resolutionMode: "PROMISE" })(event, context, callback);
  }
  {
    // --> awsServerlessExpress -> works well with api gateway REST, doesn't work well with api gateway HTTP Api
    awsServerlessExpress.proxy(server!, event, context);
  }
};

// Docs sample: https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/
//@ts-ignore
const functionUrlStreamHandler: Handler = awslambda.streamifyResponse(
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
  // For function URLs, we need to modify the path in the event
  // Function URLs don't have a base path like API Gateway

  // Log the incoming event for debugging
  const method = (event.requestContext as any)?.http?.method;

  // For function URLs, we need to modify the path in the event
  if (event.requestContext && "http" in event.requestContext) {
    // This is a function URL event
    const path = event.rawPath || "";
    console.log("Original path:", path);

    // If your Express app expects paths to start with /v1
    // and your function URL is hitting the root, you can rewrite the path
    if (!path.startsWith("/v1") && path !== "/") {
      event.rawPath = `/v1${path}`;
      // Also update the path parameter used by serverless-express
      event.path = `/v1${path}`;
    }

    if (!isProd()) {
      console.log("Modified path:", event.rawPath);
    }
  }
  (event as any).responseStream = responseStream;
  (context as any).responseStream = responseStream; // Also works

  try {
    // Get the response directly from expressApp
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
  // For function URLs, we need to modify the path in the event
  // Function URLs don't have a base path like API Gateway

  // For function URLs, we need to modify the path in the event
  if (event.requestContext && "http" in event.requestContext) {
    // This is a function URL event
    const path = event.rawPath || "";
    console.log("Original path:", path);

    // If your Express app expects paths to start with /v1
    // and your function URL is hitting the root, you can rewrite the path
    if (!path.startsWith("/v1") && path !== "/") {
      event.rawPath = `/v1${path}`;
      // Also update the path parameter used by serverless-express
      event.path = `/v1${path}`;
    }

    if (!isProd()) {
      console.log("Modified path:", event.rawPath);
    }
  }

  try {
    // Get the response directly from expressApp
    const handler = codegenieServerlessExpress({ app });
    const response = await handler(event, context, callback);

    // Check if response contains a body and it's a string
    if (response && response.body && typeof response.body === "string") {
      try {
        // Parse the JSON body and return only that
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
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    // sequelize.connectionManager.close().catch();
  }
};

export = {
  handler,
  functionUrlStreamHandler,
};
