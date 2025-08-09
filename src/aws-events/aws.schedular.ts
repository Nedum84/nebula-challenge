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

const generateEventName = (type: AwsEventType, id: string | number) => {
  return `${type}__${id}`;
};
async function create<T = any>(params: {
  type: AwsEventType;
  targetArn?: "lambda" | "sns" | "sqs";
  payload: AwsEventBody<T>["payload"];
  schedule:
  | { type: "atTime"; scheduleAt: Date | string }
    | {
        type: "CronOrRate";
        expression: `rate(${number} ${string})` | `cron(${string})`;
        startDate: Date;
        endDate?: Date;
      };
}) {
  if (process.env.NODE_ENV === "test") return true;

  const { schedule, type } = params;

  if (!params.payload.id) params.payload.id = randomUUID();
  const payload = params.payload;

  const eventName = generateEventName(type, payload.id);

  await deleteIfExist(eventName);

  const scheduleExpression: Pick<CreateScheduleCommandInput, "ScheduleExpression"> = (() => {
    if (schedule?.type === "atTime") {
      const scheduleTime = new Date(schedule?.scheduleAt).toISOString().replace(/\..+/, "");
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
    ...scheduleExpression,
  };

  if (process.env.NODE_ENV === "development") {
    return processAwsEvents({
      type: params.type,
      payload,
      ...{ event_name: eventName },
      triggeredByJob: false,
    });
  }
  try {
    const result = await schedulerClient.send(new CreateScheduleCommand(schedulerInput));
    console.log("CREATE_EVENT_SCHEDULAR_SUCCESS", result.$metadata);
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

  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") return true;
  try {
    if (!forceDelete) {
      const schedule = await schedulerClient.send(new GetScheduleCommand(schedulerInput));

      if (schedule.ScheduleExpression?.includes("at")) {
      }
      if (schedule.EndDate && new Date(schedule.EndDate) <= new Date()) {
        console.log("DONT_DELETE_YET", schedule.Name);
        return true;
      }
    }

    const result = await schedulerClient.send(new DeleteScheduleCommand(schedulerInput));

    console.log("DELETE_EVENT_SCHEDULAR_SUCCESS", result.$metadata);
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

async function lambdaHandler(event: ScheduledEvent, context: Context) {
  console.log("EVENT_SCHEDULAR");
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
