import { compact, findKey, omit, unescape } from "lodash";

import { AwsEventType } from "./types";

const onCreateAuditLog = async (
  id: string,
  payload: any,
  transaction?: any
) => {
  console.log("[[AUDIT_LOG_SKIPPED]] Database operations removed");
  console.log("[[AUDIT_LOG_PAYLOAD]]==>", `${payload.id}=>${payload.action_id}`);

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
    attachments: any[];

    raw_body_content: any;
    from?: string;
    reply_to?: string;
    recipients?: (string | any)[];
    cc?: (string | any)[];
    bcc?: (string | any)[];
    media_file_ids?: string[];
    send_method: "batch" | "separate";
    email_type: "newsletter_user" | "email";
    add_to_logs?: boolean;
    meta: any;
  },
  transaction?: any
) => {
  const to = payload.recipients || [];

  if (payload.name && (payload.email || (payload as any).address)) {
    to.push({ name: payload.name, address: payload.email || (payload as any).address });
  } else if (payload.email) {
    to.push(payload.email);
  }

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
    notification?: any;
  } & Record<string, any>,
  type: AwsEventType,
  transaction?: any
) => {
  const template = await getEmailTemplateFromDb(type, transaction);
  if (!template) return false;

  if (payload.user_id) {
    console.log("[[USER_CACHE_SKIPPED]] Database operations removed for user_id:", payload.user_id);
  }

  if (!template.tags.includes("skip-email")) {
    if (payload.notification && type !== AwsEventType.USER_VERIFY_EMAIL) {
      if (!(payload.notification.email ?? true)) {
        return;
      }
    }

    console.log("[[EMAIL_SERVICE_SKIPPED]] emailService.sendHtml commented out", {
      to: payload.email,
      subject: template.title,
      html_preview: template.content?.substring(0, 100) + "...",
    });
  }

  if (!template.tags.includes("skip-push-notification") && payload.user_id && template.content2) {
    if (!(payload?.notification?.push ?? true)) {
      return;
    }

  }

  return true;
};

const getEmailTemplateFromDb = async (type: AwsEventType, transaction?: any) => {
  console.log("[[TEMPLATE_CACHE_SKIPPED]] Database operations removed for type:", type);

  const keyType = findKey(AwsEventType, (v) => v === type);
  if (!keyType) return undefined;

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
