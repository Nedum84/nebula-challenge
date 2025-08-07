import { compact, findKey, omit, unescape } from "lodash";

import { AwsEventType } from "./types";

const onCreateAuditLog = async (
  id: string,
  payload: any, // AuditLogAttributes type removed
  transaction?: any // Transaction type removed, made optional
) => {
  // Database operations removed - AuditLog.create removed
  console.log("[[AUDIT_LOG_SKIPPED]] Database operations removed");
  console.log("[[AUDIT_LOG_PAYLOAD]]==>", `${payload.id}=>${payload.action_id}`);

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
    attachments: any[]; // EmailFileAttachment type removed

    raw_body_content: any;
    from?: string;
    reply_to?: string;
    recipients?: (string | any)[]; // EmailAddress type removed
    cc?: (string | any)[]; // EmailAddress type removed
    bcc?: (string | any)[]; // EmailAddress type removed
    media_file_ids?: string[];
    send_method: "batch" | "separate";
    email_type: "newsletter_user" | "email";
    add_to_logs?: boolean;
    meta: any; // UserMeta type removed
  },
  transaction?: any // Transaction type removed, made optional
) => {
  const to = payload.recipients || [];

  if (payload.name && (payload.email || (payload as any).address)) {
    to.push({ name: payload.name, address: payload.email || (payload as any).address });
  } else if (payload.email) {
    to.push(payload.email);
  }

  // await emailSendingService.initiateEmail(
  //   {
  //     from: payload.from!,
  //     subject: payload.subject,
  //     content: payload.content || payload.html,
  //     reply_to: payload.reply_to,
  //     recipients: to,
  //     cc: payload.cc,
  //     bcc: payload.bcc,
  //     media_file_ids: payload.media_file_ids,
  //     raw_body_content: payload.raw_body_content,
  //     send_method: payload.send_method,
  //     add_to_logs: payload.add_to_logs,
  //     email_type: payload.email_type,
  //   },
  //   { meta: payload.meta || systemUserMeta, transaction }
  // ); // emailSendingService and systemUserMeta commented out
  console.log("[[EMAIL_SENDING_SKIPPED]] emailSendingService.initiateEmail commented out", {
    to,
    subject: payload.subject,
  });

  return true;
};

const sendEmailFromDb = async (
  id: string,
  payload: {
    name?: string;
    email: string;
    user_id?: string;
    notification?: any; // UserAttributes["notification"] type removed
  } & Record<string, any>,
  type: AwsEventType,
  transaction?: any // Transaction type removed, made optional
) => {
  const template = await getEmailTemplateFromDb(type, transaction);
  if (!template) return false;

  if (payload.user_id) {
    // Database operations removed - userCache.findById removed
    console.log("[[USER_CACHE_SKIPPED]] Database operations removed for user_id:", payload.user_id);
    // if (!payload.email) payload.email = user.email;
    // if (!payload.name) payload.name = user.name;
    // if (!payload.notification) payload.notification = user.notification;
  }

  if (!template.tags.includes("skip-email")) {
    if (payload.notification && type !== AwsEventType.USER_VERIFY_EMAIL) {
      // If email notification is disabled
      if (!(payload.notification.email ?? true)) {
        return;
      }
    }

    // await emailService.sendHtml({
    //   to: [{ name: payload.name!, address: payload.email || (payload as any).address }],
    //   subject: await injectEmailVariables(template.title, payload),
    //   html: await injectEmailVariables(template.content, { ...payload }),
    // }); // emailService and injectEmailVariables commented out
    console.log("[[EMAIL_SERVICE_SKIPPED]] emailService.sendHtml commented out", {
      to: payload.email,
      subject: template.title,
      html_preview: template.content?.substring(0, 100) + "...",
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
    //     title: template.title, // injectEmailVariables commented out
    //     body: unescape(template.content2), // injectEmailVariables commented out
    //     data: {
    //       ...payload,
    //       type,
    //       // body: await injectEmailVariables(unescape(template.content2), payload),
    //       title: template.title, // injectEmailVariables commented out
    //     },
    //   });
    // }
  }

  return true;
};

const getEmailTemplateFromDb = async (type: AwsEventType, transaction?: any) => {
  // Database operations removed - staticContentsCache.findBySlug removed
  console.log("[[TEMPLATE_CACHE_SKIPPED]] Database operations removed for type:", type);

  // For DB based email templates
  const keyType = findKey(AwsEventType, (v) => v === type);
  if (!keyType) return undefined;

  // Return mock template to maintain functionality without database
  return {
    content: `<p>Email template for ${keyType}</p>`,
    content2: `Push notification for ${keyType}`,
    content3: "",
    title: `${keyType} Notification`,
    tags: ["react-email-editor"],
  };
};

export const awsCustomEventstils = {
  onCreateAuditLog,
  sendEmail,
  sendEmailFromDb,
  getEmailTemplateFromDb,
};
