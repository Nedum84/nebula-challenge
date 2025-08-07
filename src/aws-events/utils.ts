import { compact, findKey, omit, unescape } from "lodash";
import { AuditLog } from "../js-models";

import { AwsEventType } from "./types";
import { Transaction } from "sequelize";
import { systemUserMeta } from "../js-utils/user.meta.utils";
import { AuditLogAttributes } from "../js-audit-log/model";
import { UserAttributes } from "../js-user/model";
import { userCache } from "../js-user/service.cache";
import { staticContentsCache } from "../js-static-contents/service.cache";
import { EmailAddress, EmailFileAttachment } from "../js-email-service/types";
import { UserMeta } from "../types/types";
import { emailSendingService } from "../js-email-service/service.sending";
import { emailService } from "../js-email-service/service";
import { injectEmailVariables } from "../js-email-service/utils";

const onCreateAuditLog = async (
  id: string,
  payload: AuditLogAttributes,
  transaction: Transaction
) => {
  try {
    await AuditLog.create(omit(payload, "id"), { returning: false, transaction });
    console.log("[[AUDIT_LOG_ADDED]]==>", `${payload.id}=>${payload.action_id}`);
  } catch (error) {
    console.log("[[AUDIT_LOG_ERROR]]==>", error);
  }

  // TODO: create/log it on AWS Dynamo DB or on opensearch
  return true;
};

const sendEmail = async (
  id: string,
  payload: {
    name?: string;
    email: string;
    subject: string;
    content: string; // content or html
    html: string; // content or html
    attachments: EmailFileAttachment[];

    raw_body_content: any;
    from?: string;
    reply_to?: string;
    recipients?: (string | EmailAddress)[];
    cc?: (string | EmailAddress)[];
    bcc?: (string | EmailAddress)[];
    media_file_ids?: string[];
    send_method: "batch" | "separate";
    email_type: "newsletter_user" | "email";
    add_to_logs?: boolean;
    meta: UserMeta;
  },
  transaction: Transaction
) => {
  const to = payload.recipients || [];

  if (payload.name && (payload.email || (payload as any).address)) {
    to.push({ name: payload.name, address: payload.email || (payload as any).address });
  } else if (payload.email) {
    to.push(payload.email);
  }

  await emailSendingService.initiateEmail(
    {
      from: payload.from!,
      subject: payload.subject,
      content: payload.content || payload.html,
      reply_to: payload.reply_to,
      recipients: to,
      cc: payload.cc,
      bcc: payload.bcc,
      media_file_ids: payload.media_file_ids,
      raw_body_content: payload.raw_body_content,
      send_method: payload.send_method,
      add_to_logs: payload.add_to_logs,
      email_type: payload.email_type,
    },
    { meta: payload.meta || systemUserMeta, transaction }
  );

  return true;
};

const sendEmailFromDb = async (
  id: string,
  payload: {
    name?: string;
    email: string;
    user_id?: string;
    notification?: UserAttributes["notification"];
  } & Record<string, any>,
  type: AwsEventType,
  transaction: Transaction
) => {
  const template = await getEmailTemplateFromDb(type, transaction);
  if (!template) return false;

  if (payload.user_id) {
    const user = await userCache.findById(payload.user_id, transaction);
    if (!payload.email) payload.email = user.email;
    if (!payload.name) payload.name = user.name;
    if (!payload.notification) payload.notification = user.notification;
  }

  if (!template.tags.includes("skip-email")) {
    if (payload.notification && type !== AwsEventType.USER_VERIFY_EMAIL) {
      // If email notification is disabled
      if (!(payload.notification.email ?? true)) {
        return;
      }
    }

    await emailService.sendHtml({
      to: [{ name: payload.name!, address: payload.email || (payload as any).address }],
      subject: await injectEmailVariables(template.title, payload),
      html: await injectEmailVariables(template.content, { ...payload }),
    });
  }

  // --> Send EAS push notification
  if (!template.tags.includes("skip-push-notification") && payload.user_id && template.content2) {
    // If push notification is disabled
    if (!(payload?.notification?.push ?? true)) {
      return;
    }

    // const devices = await userDeviceCache.findByUserId(payload.user_id, transaction);
    // const tokens = devices.map((x) => x.eas_token);
    // if (tokens.length) {
    //   await easPushNotificationService.send({
    //     tokens: tokens,
    //     title: await injectEmailVariables(template.title, payload),
    //     body: await injectEmailVariables(unescape(template.content2), payload),
    //     data: {
    //       ...payload,
    //       type,
    //       // body: await injectEmailVariables(unescape(template.content2), payload),
    //       title: await injectEmailVariables(template.title, payload),
    //     },
    //   });
    // }
  }

  return true;
};

const getEmailTemplateFromDb = async (type: AwsEventType, transaction: Transaction) => {
  // For DB based email templates
  const keyType = findKey(AwsEventType, (v) => v === type);
  if (!keyType) return undefined;

  const template = await staticContentsCache.findBySlug(keyType, transaction);
  if (!template?.content || !template?.tags) return undefined;

  const tags = compact((template.tags || "").split(",").map((it) => it.trim()));

  if (!tags.includes("react-email-editor")) return undefined;
  if (!template.is_active) return undefined;

  return {
    content: unescape(template.content),
    content2: unescape(template.content2),
    content3: unescape(template.content3),
    title: template.title,
    tags,
  };
};

export const awsCustomEventstils = {
  onCreateAuditLog,
  sendEmail,
  sendEmailFromDb,
  getEmailTemplateFromDb,
};
