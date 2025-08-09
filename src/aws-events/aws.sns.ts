import { Context, SNSEvent } from "aws-lambda";
import { processAwsEvents } from "./service";
import { AwsEventBody, AwsEventType } from "./types";
import { awsEventScheduler } from "./aws.schedular";
import config from "../config/config";
import { randomUUID } from "crypto";
import { omit } from "lodash";
import { SNSClient, PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  apiVersion: "2012-11-05",
});

const create = async <T = any>(params: {
  type: AwsEventType;
  topicName?: string;
  payload: AwsEventBody<T>["payload"];
}) => {
  if (process.env.NODE_ENV === "test") return true;

  if (!params.payload.id) params.payload.id = randomUUID();
  const payload = params.payload;

  const body: PublishCommandInput = {
    Message: JSON.stringify({ type: params.type, payload }),
    TopicArn: params.topicName || config.SNS_TOPIC_ARN,
    MessageAttributes: { type: { DataType: "String", StringValue: params.type } },
  };

  console.log("TOPIC_PARAMS", JSON.stringify({ type: params.type, payload: omit(payload, "") }));

  if (process.env.NODE_ENV === "development") {
    return processAwsEvents({ type: params.type, payload, triggeredByJob: false });
  }
  try {
    const result = await snsClient.send(new PublishCommand(body));
    console.log("CREATE_SNS_SUCCESS", result.$metadata);
    return true;
  } catch (error) {
    console.log("CREATE_SNS_ERROR", error);
  }

  return false;
};

const sendSms = async (params: {
  phoneNumber: AwsEventType;
  message: string;
  payload: { id: string } & Record<string, string>;
}) => {
  const body: PublishCommandInput = {
    Message: params.message,
    PhoneNumber: params.phoneNumber,
  };

  console.log("SMS_PARAMS", body.Message);

  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") return true;
  try {
    const result = await snsClient.send(new PublishCommand(body));
    console.log("CREATE_SNS_SMS_SUCCESS", result.$metadata);
    return true;
  } catch (error) {
    console.log("CREATE_SNS_SMS_ERROR", error);
  }

  return false;
};


export async function lambdaHandler(event: SNSEvent, context: Context) {
  console.log("____SNS____");
  for await (const record of event.Records) {
    const body = JSON.parse(record.Sns.Message) as { event_name?: string } & AwsEventBody;

    if (body.payload && body.type) {
      const res = await processAwsEvents({
        payload: body.payload,
        type: body.type,
      });
    }
  }
}

export const awsSns = {
  lambdaHandler,
  create,
  sendSms,
};
