import { Context, SQSEvent } from "aws-lambda";
import { AwsEventBody, AwsEventType } from "./types";
import { processAwsEvents } from "./service";
import config from "../config/config";
import { randomUUID } from "crypto";

import {
  SQS,
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  ReceiveMessageResult,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  apiVersion: "2012-11-05",
});

const create = async <T = any>(params: {
  type: AwsEventType;
  queueUrl?: string;
  payload: AwsEventBody<T>["payload"];
}) => {
  if (process.env.NODE_ENV === "test") return true;
  if (process.env.NODE_ENV === "development") return true;

  if (!params.payload.id) params.payload.id = randomUUID();
  const payload = params.payload;

  const body: SendMessageCommandInput = {
    MessageBody: JSON.stringify({ type: params.type, payload }),
    QueueUrl: params.queueUrl || config.SQS_QUEUE_URL,
  };

  if (process.env.NODE_ENV === "development") {
    return processAwsEvents({ type: params.type, payload, triggeredByJob: false });
  }
  try {
    const result = await sqsClient.send(new SendMessageCommand(body));
    console.log("CREATE_SQS_SUCCESS", result.$metadata);
    return true;
  } catch (error) {
    console.log("CREATE_SQS_ERROR", error);
  }

  return false;
};

const deleteQueueItem = async (receiptHandle: string, queueUrl?: string) => {
  const params: DeleteMessageCommandInput = {
    QueueUrl: queueUrl || config.SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle,
  };

  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") return true;
  try {
    const result = await sqsClient.send(new DeleteMessageCommand(params));
    console.log("DELETE_SQS_QUEUE_SUCCESS", result.$metadata);
    return true;
  } catch (error) {
    console.log("DELETE_SQS_QUEUE_ERROR", error);
  }

  return;
};

const read = async (params: {
  queueUrl?: string;
}): Promise<ReceiveMessageResult["Messages"] | undefined> => {
  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") return undefined; // isTest and isLocal commented out

  const body: ReceiveMessageCommandInput = {
    MaxNumberOfMessages: 5,
    QueueUrl: params.queueUrl || config.SQS_QUEUE_URL,
  };

  try {
    const result = await sqsClient.send(new ReceiveMessageCommand(body));
    console.log("[[READ_SQS_SUCCESS]]==>", result.$metadata);
    console.log("[[READ_SQS_SUCCESS_MESSAGE]]==>", result.Messages);
    return result.Messages;
  } catch (error) {
    console.log("[[READ_SQS_ERROR]]==>", error);
  }

  return undefined;
};

export async function lambdaHandler(event: SQSEvent, context: Context) {
  console.log("____SQS____");
  for await (const record of event.Records) {
    const body = JSON.parse(record.body) as { event_name?: string } & AwsEventBody;

    if (body.payload && body.type) {
      const res = await processAwsEvents({
        payload: body.payload,
        type: body.type,
      });

      if (res) await deleteQueueItem(record.receiptHandle);
    }
  }
  return {};
}

export const awsSqs = {
  lambdaHandler,
  create,
  deleteQueueItem,
  read,
};
