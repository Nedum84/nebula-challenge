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
  if (process.env.NODE_ENV === "test") return true; // isTest commented out
  if (process.env.NODE_ENV === "development") return true; // isLocal commented out

  if (!params.payload.id) params.payload.id = randomUUID();
  const payload = params.payload; // getModelRawData commented out

  const body: SendMessageCommandInput = {
    MessageBody: JSON.stringify({ type: params.type, payload }),
    QueueUrl: params.queueUrl || config.SQS_QUEUE_URL,
  };

  if (process.env.NODE_ENV === "development") {
    // isLocal commented out
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

  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") return true; // isTest and isLocal commented out
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
    // OR
    // const result = await sqs.receiveMessage(body);
    console.log("[[READ_SQS_SUCCESS]]==>", result.$metadata);
    console.log("[[READ_SQS_SUCCESS_MESSAGE]]==>", result.Messages);
    return result.Messages;
  } catch (error) {
    console.log("[[READ_SQS_ERROR]]==>", error);
  }

  return undefined;
};

/**
 * @param event =
{
  Records: [
    {
      messageId: '37dbafb8-33df-4955-be82-30fe00605227',
      receiptHandle: 'AQEBphSPkviJdlrCU60Js3lz3YzDl2kjNfrpJJ/nb57dqgFSCpy1ZY7Fm6zHp4j8FvfafbfCzf2kQtHw9qIzh6dnJR7OYbhXEtu53cyhxDJdUoEAS9xlMbVEJBOdLOLXXbwcy1blNpb3b4tcg4jZ/7MTiDfYZK/WAovxNkbnTb2pAJ3fm+1cki1iI8nC4EAnLHNytOTYQMV+UOTZxFCpXFGKEdUzx2wzFnYCYTKVQBa+pJznssHoRHO6LTlcbXKUiSeqwFV/RO46iptbw518Sx7ckKHo+9YjVy2Wp494ObX1jLIhoXGPqU6hVWjutTVlio7DzS+kIkalMKAhbX5ADz+fyTre/RSWS368syUHw9XI6NfrhJYAgduak49z7UvOODAuMdludZqXlILNWk0vshbHFtS9bCRl1pARBLRakbIR8fVEz1GxXn0eIBYmA3ayGbmm',
      body: '{"event_name":"customer_reg_t_10mins--dc46cab2-3c8e-4ff6-bac4-08595db512035","type":"customer_reg_t_10mins","payload":{"id":"dc46cab2-3c8e-4ff6-bac4-08595db512035","phoneNumber":"0908723657483287467182736472874","message":"Hello Mahn! How are you doing???"}}',
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1692526062163',
        SenderId: 'AROA5CWWXIRWKJGNHRLNW:a97ff351459d386db932be02956f6dd6',
        ApproximateFirstReceiveTimestamp: '1692526062170'
      },
      messageAttributes: {},
      md5OfBody: '41288237d65b5b9b9564b691bf8c0cc6',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:eu-west-2:899172222060:iclass-dev-IclassSqsQueue-cjMHd913Px2D',
      awsRegion: 'eu-west-2'
    }
  ]
}
 * 
 */
export async function lambdaHandler(event: SQSEvent, context: Context) {
  console.log("____SQS____");
  // console.log(event);
  for await (const record of event.Records) {
    const body = JSON.parse(record.body) as { event_name?: string } & AwsEventBody;

    // MIGHT BE TRIGGERED FROM SEVERAL EVENT TYPES,
    // FOR WINZY EVENTS/PROCESS
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
