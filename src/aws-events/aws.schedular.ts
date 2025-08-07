import { Context, ScheduledEvent } from "aws-lambda";
import { AwsEventBody, AwsEventType } from "./types";
import { processAwsEvents } from "./service";
import { randomUUID } from "crypto";
import config from "../config/config";
import {
  Scheduler,
  SchedulerClient,
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  CreateScheduleInput,
  GetScheduleCommand,
  DeleteScheduleCommand,
  DeleteScheduleCommandInput,
} from "@aws-sdk/client-scheduler";

const schedulerClient = new SchedulerClient({ region: config.AWS_REGION });
const scheduler = new Scheduler({ region: config.AWS_REGION });

const defaultTz = "Europe/London";
// const defaultTz = "Africa/Lagos";

const generateEventName = (type: AwsEventType, id: string | number) => {
  return `${type}__${id}`;
};
async function create<T = any>(params: {
  type: AwsEventType;
  targetArn?: "lambda" | "sns" | "sqs";
  payload: AwsEventBody<T>["payload"];
  schedule: // https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
  | { type: "atTime"; scheduleAt: Date | string }
    | {
        type: "CronOrRate";
        expression: `rate(${number} ${string})` | `cron(${string})`;
        startDate: Date;
        endDate?: Date;
      };
}) {
  // if (isTest()) return true;
  if (process.env.NODE_ENV === "test") return true;
  // if (isLocal()) return true;

  const { schedule, type } = params;

  if (!params.payload.id) params.payload.id = randomUUID();
  const payload = params.payload; // getModelRawData commented out

  const eventName = generateEventName(type, payload.id);

  await deleteIfExist(eventName); // Delete if event exist

  const scheduleExpression: Pick<CreateScheduleCommandInput, "ScheduleExpression"> = (() => {
    if (schedule?.type === "atTime") {
      const scheduleTime = new Date(schedule?.scheduleAt).toISOString().replace(/\..+/, ""); // momentJs commented out
      return {
        ScheduleExpression: `at(${scheduleTime})`,
        ScheduleExpressionTimezone: defaultTz,
      };
    }

    return {
      ScheduleExpression: schedule.expression,
      StartDate: schedule.startDate,
      EndDate: schedule.endDate,
    };
  })();
  console.log("[[SCHEDULAR_AT]]", { ...scheduleExpression, eventName });

  const arnTargets = {
    lambda: config.JOB_LAMBDA_ARN!,
    sns: config.SNS_TOPIC_ARN!,
    sqs: config.SQS_QUEUE_ARN!,
  };
  const target: CreateScheduleInput["Target"] = {
    RoleArn: config.SERVICE_LAMBDA_ROLE!,
    Arn: arnTargets[params.targetArn || "lambda"],
    Input: JSON.stringify({ event_name: eventName, type, payload }),
  };

  const schedulerInput: CreateScheduleCommandInput = {
    Name: eventName,
    FlexibleTimeWindow: {
      Mode: "OFF",
    },
    Target: target,
    GroupName: config.EVENT_SCHEDULAR_GROUP_NAME,
    // ScheduleExpression: `at(${scheduleTime})`,
    ...scheduleExpression,
  };

  if (process.env.NODE_ENV === "development") {
    // isLocal commented out
    return processAwsEvents({
      type: params.type,
      payload,
      ...{ event_name: eventName },
      triggeredByJob: false,
    });
  }
  try {
    const result = await schedulerClient.send(new CreateScheduleCommand(schedulerInput));
    // OR
    // const result = await scheduler.createSchedule(schedulerInput);
    console.log("CREATE_EVENT_SCHEDULAR_SUCCESS", result.$metadata);
    // return result.$response.httpResponse.statusCode === 200;
    return true;
  } catch (error) {
    console.log("CREATE_EVENT_SCHEDULAR_ERROR", error);
  }

  return false;
}

async function deleteIfExist(eventName: string, forceDelete = false) {
  const schedulerInput: DeleteScheduleCommandInput = {
    Name: eventName,
    GroupName: config.EVENT_SCHEDULAR_GROUP_NAME,
  };

  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") return true; // isTest and isLocal commented out
  try {
    // If not force delete,
    if (!forceDelete) {
      const schedule = await schedulerClient.send(new GetScheduleCommand(schedulerInput));
      // OR
      // const result = await scheduler.getSchedule(schedulerInput);

      if (schedule.ScheduleExpression?.includes("at")) {
        // console.log("ONE_TIME_EVENT");
      }
      if (schedule.EndDate && new Date(schedule.EndDate) <= new Date()) {
        // momentJs commented out
        console.log("DONT_DELETE_YET", schedule.Name);
        return true;
      }
    }

    const result = await schedulerClient.send(new DeleteScheduleCommand(schedulerInput));
    // OR
    // const result = await scheduler.deleteSchedule(schedulerInput);

    console.log("DELETE_EVENT_SCHEDULAR_SUCCESS", result.$metadata);
    // return result.$response.httpResponse.statusCode === 200;
    return true;
  } catch (error) {
    console.log("DELETE_EVENT_SCHEDULAR_ERROR", error);

    const { code, statusCode } = error;
    if (code === "ResourceNotFoundException" && statusCode === 404) {
      return true;
    }
  }

  return false;
}

/** Event scheduler here: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/scheduler/command/CreateScheduleCommand/
 * When event scheduler is fed with JSON input,
 * the lambda fn when triggered will have exactly that JSON input as the event. i.e @param input(event schedular target input) = @param event (Lambda invocation event)
 * if not, it will give @param event = 
 * {
  version: '0',
  id: '2964a5ed-d20d-4fd8-8a10-25397c552ff5',
  'detail-type': 'Scheduled Event',
  source: 'aws.scheduler',
  account: '899172222060',
  time: '2023-07-05T22:25:22Z',
  region: 'eu-west-2',
  resources: [
    'arn:aws:scheduler:eu-west-2:899172222060:schedule/default/65bcf3f2-f9fd-49d4-b0f4-e7bd9d67563d-NAXVVV'
  ],
  detail: '{}'
}

With JSON input, it gives @param event = JSON input = 
{
  id: '275e3a1a-d165-4386-88cc-a93065bee793',
  body: {
    atTime: '2023-07-05T22:23:22',
    phoneNumber: '0812344736545',
    message: 'Hello Mahn!'
  }
}
*/
async function lambdaHandler(event: ScheduledEvent, context: Context) {
  console.log("EVENT_SCHEDULAR");
  // console.log(event);
  /**
  @var event_name = unique ID of the event schedular/Name of the schedular
  @var payload:object  = {
        @var id e.g userId, storeId, variationId, etc
        @var type e.g @AwsEventType on ./types.ts
        @var payload = object
    }
  */
  const body = event as unknown as { event_name: string } & AwsEventBody;
  if (!body.event_name) return;

  const res = await processAwsEvents({
    payload: body.payload,
    type: body.type,
  });

  if (res) await deleteIfExist(body.event_name);
}

export const awsEventScheduler = {
  lambdaHandler,
  generateEventName,
  create,
  deleteIfExist,
};
