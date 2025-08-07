"use strict";
// import serverlessHttp from 'serverless-http';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
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

// import vendiaServerlessExpress from "@vendia/serverless-express";
import codegenieServerlessExpress from "@codegenie/serverless-express";
// TODO: Missing import - comment out until module is available
// import { isProd } from "../js-utils/env.utils";
import { ConfigureResult } from "@codegenie/serverless-express/src/configure";

// const server = awsServerlessExpress.createServer(app);

// Only create the server if you're actually using aws-serverless-express
const server =
  process.env.USE_VENDIA_FOR_EXPRESS !== "true" && process.env.USE_CODEGENIE_FOR_EXPRESS !== "true"
    ? awsServerlessExpress.createServer(app)
    : null;

const expressApp: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent & { rawPath: string },
  context: Context,
  callback
) => {
  try {
    let response: Handler<any, any> & ConfigureResult<any, any>;

    if (process.env.USE_CODEGENIE_FOR_EXPRESS === "true") {
      const handler = codegenieServerlessExpress({
        app,
        resolutionMode: "PROMISE", // PROMISE, CALLBACK, CONTEXT
        respondWithErrors: true,
        // stripBasePath: true,
        binarySettings: {
          isBinary: true,
          contentTypes: ["application/octet-stream", "text/event-stream"],
        },
      });
      response = await handler(event, context, callback);
    }
    //  else if (process.env.USE_VENDIA_FOR_EXPRESS === "true") {
    //   const handler = vendiaServerlessExpress({
    //     app,
    //     resolutionMode: "PROMISE", // PROMISE, CALLBACK, CONTEXT
    //     respondWithErrors: true,
    //     // stripBasePath: true,
    //     binarySettings: {
    //       isBinary: true,
    //       contentTypes: ["application/octet-stream", "text/event-stream"],
    //     },
    //   });
    //   response = await handler(event, context, callback);
    // }
    else {
      // For the original implementation, we need to wrap the callback in a promise
      response = await new Promise((resolve) => {
        awsServerlessExpress.proxy(server!, event, context, "CALLBACK", (err, result) => {
          if (err) {
            console.error("Error in serverless express proxy:", err);
          }
          resolve(result as unknown as typeof response);
        });
      });
    }

    // If there's a callback, use it (for backward compatibility)
    if (callback && typeof callback === "function") {
      callback(null, response as unknown as APIGatewayProxyResult);
    }

    return response as unknown as APIGatewayProxyResult;
  } catch (error) {
    console.error("Error in expressApp:", error);
    if (callback && typeof callback === "function") {
      callback(error);
    }
    throw error;
  }
};

const functionUrl: Handler = async (
  event: APIGatewayProxyEvent & { rawPath: string },
  context: Context,
  callback
) => {
  console.log(getLambdaEventSource(event), "EVENT_SOURCE_F_URL"); // TODO: Remove Later

  // awsServerlessExpress.proxy(server!, event, context);

  // For function URLs, we need to modify the path in the event
  // Function URLs don't have a base path like API Gateway

  // Log the incoming event for debugging
  // TODO: Comment out until isProd is available
  // if (!isProd()) {
  //   console.log("Event method:", (event.requestContext as any)?.http?.method);
  //   console.log("Event path:", event.rawPath);
  // }

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

    // TODO: Comment out until isProd is available
    // if (!isProd()) {
    //   console.log("Modified path:", event.rawPath);
    // }
  }

  try {
    // Get the response directly from expressApp
    const response = await expressApp(event, context, callback);

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
      return functionUrl(event, context, callback);
    case "isEventScheduler":
      return awsEventScheduler.lambdaHandler(event, context);
    default:
      console.error("Unsupported event source", event);
  }
};

const handler: Handler = (event: APIGatewayProxyEvent | any, context: Context, callback: any) => {
  const source = getLambdaEventSource(event);

  try {
    return router(source, event, context, callback);
  } finally {
    // Database connections cleanup removed - Sequelize connectionManager removed
  }
};

export = {
  handler,
};
