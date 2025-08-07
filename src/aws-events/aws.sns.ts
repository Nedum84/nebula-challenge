import { Context, SNSEvent } from "aws-lambda";
import { processAwsEvents } from "./service";
import { AwsEventBody, AwsEventType } from "./types";
import { awsEventScheduler } from "./aws.schedular";
import config from "../config/config";
import { randomUUID } from "crypto";
import { getModelRawData } from "../js-models/utils";
import { omit } from "lodash";
import { isLocal, isTest } from "../js-utils/env.utils";
import { sesEmailNotification } from "../js-email-log/utils";
import { SNSClient, PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  apiVersion: "2012-11-05",
});

const create = async <T = any>(params: {
  type: AwsEventType;
  topicName?: string;
  payload: AwsEventBody<T>["payload"];
}) => {
  if (isTest()) return true;
  // if (isLocal()) return true;

  if (!params.payload.id) params.payload.id = randomUUID();
  const payload = getModelRawData(params.payload); // force it to be JSONify(by removing sequelize unwanted tags)

  const body: PublishCommandInput = {
    Message: JSON.stringify({ type: params.type, payload }),
    TopicArn: params.topicName || config.SNS_TOPIC_ARN,
    MessageAttributes: { type: { DataType: "String", StringValue: params.type } },
  };

  console.log("TOPIC_PARAMS", JSON.stringify({ type: params.type, payload: omit(payload, "") }));

  if (isLocal()) {
    return processAwsEvents({ type: params.type, payload, triggeredByJob: false });
  }
  try {
    const result = await snsClient.send(new PublishCommand(body));
    // OR
    // const result = await sns.publish(body);
    console.log("CREATE_SNS_SUCCESS", result.$metadata);
    // return result.$response.httpResponse.statusCode === 200;
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

  if (isTest() || isLocal()) return true;
  try {
    const result = await snsClient.send(new PublishCommand(body));
    // OR
    // const result = await sns.publish(body);
    console.log("CREATE_SNS_SMS_SUCCESS", result.$metadata);
    // return result.$response.httpResponse.statusCode === 200;
    return true;
  } catch (error) {
    console.log("CREATE_SNS_SMS_ERROR", error);
  }

  return false;
};

/**
{
  Records: [
    {
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn: 'arn:aws:sns:eu-west-2:899172222060:dev-iclassSnsTopic:f0a1ec49-8905-4926-948d-b97d6ab63297',
      Sns: {
        Type: 'Notification',
        MessageId: '2468f04e-191f-5e66-b399-ad1269b6b6c7',
        TopicArn: 'arn:aws:sns:eu-west-2:899172222060:dev-iclassSnsTopic',
        Subject: null,
        Message: '{"event_name":"customer_reg_t_10mins--16f25b82-5f71-4ac9-b669-860e99d3b6633","type":"customer_reg_t_10mins","payload":{"id":"16f25b82-5f71-4ac9-b669-860e99d3b6633","phoneNumber":"0908723657483287467182736472874","message":"Hello Mahn! How are you doing???"}}',
        Timestamp: '2023-08-20T19:50:01.811Z',
        SignatureVersion: '1',
        Signature: 'gsKeck9mFlPUbthdrGuHBarX7RXM/r46KMuKgl3ULmPYryALn8eR8Cs2msXyEnnq7MjCAj81gLrgAr+sUbAMhd05QADxs8W8BggflSwfqsPT4ulOnvA2oMYpk5dkkz/qq2vA3faIBN748QbUMFKkL7CyOsvQWFqFgLQReImoCmUUULE6oBMQs/h3zHRlVmv5qFnRQ1TXtKnmBH4gTu/Aw++b8yE/z7faa5vlb36feXHAso7XuxoEzxlHNCxudYa2ZjCSK6oFIKtvNe7UVTtKDbMy3HXYLowQXngb1aAH3wIJ7ewWo6UKG6XYdsbABGCaDq16V2rnVD0KZ8zpHnUb1A==',
        SigningCertUrl: 'https://sns.eu-west-2.amazonaws.com/SimpleNotificationService-01d088a6f77103d0fe307c0069e40ed6.pem',
        UnsubscribeUrl: 'https://sns.eu-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-2:899172222060:dev-iclassSnsTopic:f0a1ec49-8905-4926-948d-b97d6ab63297',
        MessageAttributes: {}
      }
    }
  ]
}
 * 
 */

export async function lambdaHandler(event: SNSEvent, context: Context) {
  console.log("____SNS____");
  for await (const record of event.Records) {
    const body = JSON.parse(record.Sns.Message) as { event_name?: string } & AwsEventBody;

    // MIGHT BE TRIGGERED FROM SEVERAL EVENT TYPES,
    // FOR WINZY EVENTS/PROCESS
    if (body.payload && body.type) {
      const res = await processAwsEvents({
        payload: body.payload,
        type: body.type,
      });

      // Triggered from event schedular
      if (res && body.event_name) {
        await awsEventScheduler.deleteIfExist(body.event_name);
      }
    } else {
      // FOR SES TRIGGERED
      if ((body as any).eventType === "Complaint" || (body as any).eventType === "Bounce") {
        return sesEmailNotification(body as any);
      }

      // OTHER TRIGGERS
      console.log("[[SNS_OTHER_PAYLOAD]]", body);
    }
  }
}

export const awsSns = {
  lambdaHandler,
  create,
  sendSms,
};
