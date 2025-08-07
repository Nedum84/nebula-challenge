import sequelize, { AuditLog } from "../js-models";
import { AwsEventBody, AwsEventType } from "./types";
import { awsCustomEventstils } from "./utils";
import { systemUserMeta } from "../js-utils/user.meta.utils";
import { slackService } from "../js-notification/service.slack";
import { SlackChannels } from "../js-notification/types";
import { Transaction } from "sequelize";
import { userService } from "../js-user/service";
import { systemWalletUserId } from "../js-user/constants";
import { s3CacheService } from "../js-redis/s3.cache.service";

export async function processAwsEvents(
  data: AwsEventBody & {
    /** Triggered by JOB(Lambda) or by API(HTTP) @default true */
    triggeredByJob?: boolean;
  }
) {
  // Each message is a transaction
  const t = await sequelize.transaction();
  const { type, triggeredByJob = true } = data;
  const { id } = data.payload;
  const payload = data.payload;
  console.log("[[JOB_TRIGGER]]==>", { type, payload });

  try {
    // If email template is associated with this event, fire the email
    await awsCustomEventstils.sendEmailFromDb(id, payload as any, type, t);

    await processJobEvent(type, id, payload, t);

    await t.commit();
    return true;
  } catch (error) {
    console.log("[AWS_EVENT_ERROR]: ", error);

    await t.rollback();

    if (triggeredByJob) {
      try {
        await Promise.allSettled([
          slackService.sendMessage(error, SlackChannels.ERROR),
          AuditLog.create(
            {
              description: "AWS Event JOB_Error Log",
              action_id: id ?? "event_error",
              event_type: "create",
              tag: "event_error",
              extra: error?.message || "",
              event_time: new Date(),
              user_name: systemUserMeta.logs.name as string,
              user_type: "system",
              created_by: systemUserMeta.user.admin_id,
            },
            { returning: false }
          ),
        ]);
        // Audit Logs is done with AWS sns/sqs event except for test & Local
      } catch (error) {
        slackService.sendMessage(
          `Critical AWS Event Error: Type:${type}, Id: ${id}, Payload: ${JSON.stringify(payload)}`,
          SlackChannels.ERROR
        );
      }
    }

    if (error instanceof Error) throw error;
    throw new Error(error);

    // return false;
  } finally {
  }
}

async function processJobEvent(type: AwsEventType, id: string, payload: any, t: Transaction) {
  switch (type) {
    case AwsEventType.TRANSFER_CASH: {
      // if (payload.sender === systemWalletUserId) {
      //   slackService.sendMessage(
      //     {
      //       type: "ATTEMPT_TO_TRANSFER_FROM_WALLET_ACCOUNT",
      //       message: "Transfer disabled from the source account",
      //     },
      //     SlackChannels.ERROR
      //   );
      //   return {};
      // }
      // return paymentService.transfer(
      //   {
      //     sender: payload.sender,
      //     receiver: payload.receiver,
      //     reference_id: payload.reference_id,
      //     amount: payload.amount,
      //     currency: payload.currency,
      //     type: payload.type,
      //     sender_desc: payload.sender_desc,
      //     receiver_desc: payload.receiver_desc,
      //   },
      //   { transaction: t }
      // );
    }

    // case AwsEventType.PROCESS_COUPON_TOPUP: {
    //   return couponService.applyCoupon(
    //     { coupon_code: payload.coupon_code, user_id: payload.user_id },
    //     { meta: payload?.user_meta || systemUserMeta, transaction: t }
    //   );
    // }

    case AwsEventType.DELETE_USER_ACCOUNT: {
      return userService.deleteAccount(
        { user_id: payload.user_id },
        { meta: payload?.user_meta || systemUserMeta, transaction: t }
      );
    }

    // case AwsEventType.REMARK_GIVEAWAY_QUESTION_RESPONSES: {
    //   return giveawayResponseService.remarkGiveawayQuestionResponses(
    //     { giveaway_id: id, response_ids: payload.response_ids },
    //     { transaction: t, meta: payload?.user_meta || systemUserMeta }
    //   );
    // }

    // ------> CUSTOM EVENTS
    case AwsEventType.AUDIT_LOGS: {
      return awsCustomEventstils.onCreateAuditLog(id, payload as any, t);
    }
    case AwsEventType.SEND_ANY_EMAIL: {
      return awsCustomEventstils.sendEmail(id, payload as any, t);
    }

    case AwsEventType.CACHE_EXPIRATION: {
      // Delete the cached item from S3
      const cacheKey = payload.cacheKey || id;
      console.log(`[CACHE_EXPIRATION] Deleting expired cache key: ${cacheKey}`);
      
      try {
        await s3CacheService.del(cacheKey);
        console.log(`[CACHE_EXPIRATION] Successfully deleted cache key: ${cacheKey}`);
      } catch (error) {
        console.error(`[CACHE_EXPIRATION] Failed to delete cache key: ${cacheKey}`, error);
        throw error;
      }
      
      return { deleted: true, cacheKey };
    }

    default:
      break;
  }
}
