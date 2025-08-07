import { AwsEventBody, AwsEventType } from "./types";
import { awsCustomEventstils } from "./utils";

export async function processAwsEvents(
  data: AwsEventBody & {
    /** Triggered by JOB(Lambda) or by API(HTTP) @default true */
    triggeredByJob?: boolean;
  }
) {
  // Database transaction removed - no longer using sequelize transactions
  const { type, triggeredByJob = true } = data;
  const { id } = data.payload;
  const payload = data.payload;
  console.log("[[JOB_TRIGGER]]==>", { type, payload });

  try {
    // If email template is associated with this event, fire the email
    await awsCustomEventstils.sendEmailFromDb(id, payload as any, type);

    await processJobEvent(type, id, payload);

    return true;
  } catch (error) {
    console.log("[AWS_EVENT_ERROR]: ", error);

    if (triggeredByJob) {
      try {
        await Promise.allSettled([
          // slackService.sendMessage(error, SlackChannels.ERROR), // slackService commented out
          Promise.resolve(
            console.log("[[SLACK_SERVICE_SKIPPED]] slackService.sendMessage commented out", error)
          ),
        ]);
        // Audit Logs is done with AWS sns/sqs event except for test & Local
      } catch (error) {}
    }

    if (error instanceof Error) throw error;
    throw new Error(error);

    // return false;
  } finally {
  }
}

async function processJobEvent(type: AwsEventType, id: string, payload: any, t?: any) {
  // Transaction type removed
  switch (type) {
    case AwsEventType.USER_CREATED: {
      // TODO: Send email/perform actions
    }

    case AwsEventType.USER_REG_T10MINS: {
      // TODO: Send email/perform actions
    }

    default:
      break;
  }
}
