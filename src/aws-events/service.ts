import { AwsEventBody, AwsEventType } from "./types";

export async function processAwsEvents(
  data: AwsEventBody & {
    triggeredByJob?: boolean;
  }
) {
  const { type, triggeredByJob = true } = data;
  const { id } = data.payload;
  const payload = data.payload;
  console.log("[[JOB_TRIGGER]]==>", { type, payload });

  try {
    await processJobEvent(type, id, payload);

    return true;
  } catch (error) {
    console.log("[AWS_EVENT_ERROR]: ", error);

    if (triggeredByJob) {
      try {
        await Promise.allSettled([
          Promise.resolve(
            console.log("[[SLACK_SERVICE_SKIPPED]] slackService.sendMessage commented out", error)
          ),
        ]);
      } catch (error) {}
    }

    if (error instanceof Error) throw error;
    throw new Error(error);
  } finally {
  }
}

async function processJobEvent(type: AwsEventType, id: string, payload: any, t?: any) {
  switch (type) {
    case AwsEventType.USER_CREATED: {
    }

    case AwsEventType.USER_REG_T10MINS: {
    }

    default:
      break;
  }
}
