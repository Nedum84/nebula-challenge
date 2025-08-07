import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().default("development"),
    REGION: Joi.string().default("eu-west-2"),
    API_BASE_URL: Joi.string().default("http://localhost:8012"),
    USER_CLIENT_URL: Joi.string().default("http://localhost:5005"),
    ADMIN_CLIENT_URL: Joi.string().default("http://localhost:5006"),
    PORT: Joi.number().default(8012),
    JWT_SECRET: Joi.string().description("JWT secret key").default("jwt-token-secret"),
    JWT_SECRET_ADMIN: Joi.string().description("JWT secret key").default("jwt-token-secret-admin"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(90)
      .description("days after which refresh tokens expire"),
    DB_NAME: Joi.string().default("db-name"),
    DB_USERNAME: Joi.string().default("postgres"),
    DB_PASSWORD: Joi.string().default("1223"),
    DB_HOST: Joi.string().default("localhost"),
    DB_PORT: Joi.number().default(5432),
    DB_ENABLE_SSL: Joi.boolean().default(false),
    DB_REJECT_UNAUTHORIZED_SSL: Joi.boolean().default(false),

    USE_OPENSEARCH: Joi.boolean().default(true),
    USE_CACHE: Joi.boolean().default(true),
    AWS_S3_BUCKET_NAME: Joi.string().default("ecom-bucket-name"),
    AWS_REGION: Joi.string().default("eu-west-2"),
    AWS_S3_DISTRIBUTION: Joi.string().default(null),
    CLOUDFRONT_ASSETS: Joi.string().default("https://assets.iclass.school"),

    AWS_S3_IMAGE_UPLOAD_PATH: Joi.string().default("image"),
    AWS_S3_VIDEO_UPLOAD_PATH: Joi.string().default("video"),
    AWS_S3_PDF_UPLOAD_PATH: Joi.string().default("pdf"),
    AWS_S3_ZIP_UPLOAD_PATH: Joi.string().default("zip"),
    AWS_S3_ICS_UPLOAD_PATH: Joi.string().default("ics"),
    AWS_S3_OTHERS_UPLOAD_PATH: Joi.string().default("others"),

    AWS_S3_ACCESS_KEY_ID: Joi.string(),
    AWS_S3_SECRET_ACCESS_KEY: Joi.string(),

    AWS_SES_ACCESS_KEY_ID: Joi.string(),
    AWS_SES_SECRET_ACCESS_KEY: Joi.string(),

    AWS_AI_ACCESS_KEY_ID: Joi.string(),
    AWS_AI_SECRET_ACCESS_KEY: Joi.string(),

    AWS_SES_DEFAULT_SEND_FROM: Joi.string(),

    MINIO_BASE_URL: Joi.string().default("http://localhost:9002"), // aka - MINIO_S3_ENDPOINT
    MINIO_USERNAME: Joi.string().default("admin"),
    MINIO_PASSWORD: Joi.string().default("iClass1234"),

    OPENSEARCH_NODE: Joi.string().default("https://localhost:9205"),
    OPENSEARCH_USERNAME: Joi.string().default("admin"),
    OPENSEARCH_PASSWORD: Joi.string().default("admin"),

    REDIS_HOST: Joi.string().default("localhost"),
    REDIS_PORT: Joi.string().default("6379"),
    REDIS_PASSWORD: Joi.string().default("iClass1234"),
    USE_REDIS_TLS: Joi.boolean().default(false),
    REDIS_URL: Joi.string(),

    EMAIL_TEST: Joi.string().default("chinedum412@gmail.com"),
    EMAIL_TEST_APP_PASSWORD: Joi.string().default("secret"),
    USE_GMAIL_SMTP: Joi.boolean().default(true),

    FLW_SECRET_KEY: Joi.string(),
    FLW_SECRET_HASH: Joi.string(),

    WITHDRAWAL_TRANSACTION_FEE: Joi.number().default(50),

    SQUAD_SECRET_KEY: Joi.string(),
    PAYSTACK_SECRET_KEY: Joi.string(),

    PUSHER_APP_ID: Joi.string(),
    PUSHER_KEY: Joi.string(),
    PUSHER_SECRET: Joi.string(),
    PUSHER_CLUSTER: Joi.string(),

    SERVICE_LAMBDA_ROLE: Joi.string(),
    API_LAMBDA_ARN: Joi.string(),
    JOB_LAMBDA_ARN: Joi.string(),
    EVENT_SCHEDULAR_GROUP_NAME: Joi.string(),
    SNS_TOPIC_NAME: Joi.string(),
    SNS_TOPIC_ARN: Joi.string(),
    SQS_QUEUE_URL: Joi.string(),
    SQS_QUEUE_ARN: Joi.string(),

    SLACK_AUTH_TOKEN: Joi.string(),
    SLACK_GENERIC_CHANNEL_ID: Joi.string(),
    SLACK_ERROR_CHANNEL_ID: Joi.string(),
    SLACK_DEV_CHANNEL_ID: Joi.string(),

    RSA_PUBLIC_KEY_HTTP_REQEUST: Joi.string(),
    RSA_PRIVATE_KEY_HTTP_REQEUST: Joi.string(),
    RSA_PUBLIC_KEY_HTTP_REQEUST_MOBILE: Joi.string(),
    RSA_PRIVATE_KEY_HTTP_REQEUST_MOBILE: Joi.string(),
    ENABLE_CSRF_TOKEN: Joi.boolean().default(false),
    CSRF_TOKEN_EXPIRES_SECS: Joi.number().default(30),

    // Whatsapp
    WA_API_VERSION: Joi.string().default("v17.0"),
    WA_API_PHONE_NUMBER_ID: Joi.string().default("215625891628733"),
    WA_API_ACCESS_TOKEN: Joi.string(),

    SMS_CHANNEL: Joi.string(),
    TERMII_API_KEY: Joi.string(),

    GOOGLE_AUTH_KEY_API: Joi.string(),
    GOOGLE_GEMINI_KEY: Joi.string(),

    GOOGLE_CLIENT_ID: Joi.string(),
    GOOGLE_CLIENT_SECRET: Joi.string(),

    TWITTER_CLIENT_ID: Joi.string(),
    TWITTER_CLIENT_SECRET: Joi.string(),
    GITHUB_CLIENT_ID: Joi.string(),
    GITHUB_CLIENT_SECRET: Joi.string(),

    APPLE_AUTH_KEY: Joi.string(),

    PAYMENT_CHANNEL_WEB: Joi.string().valid("flw", "paystack", "squad").default("paystack"),
    PAYMENT_CHANNEL_MOBILE: Joi.string().valid("flw", "paystack", "squad").default("paystack"),

    ANDROID_APP_VERSION_CODE: Joi.number().default(2),
    ANDROID_APP_VERSION_NAME: Joi.string().default("1.0.2"),
    ANDROID_APP_VERSION_CHANGES: Joi.string().default("Bug fixes & others"),
    ANDROID_MIN_APP_VERSION_CODE: Joi.number().default(1),

    IOS_APP_VERSION_CODE: Joi.number().default(2),
    IOS_APP_VERSION_NAME: Joi.string().default("1.0.2"),
    IOS_APP_VERSION_CHANGES: Joi.string().default("Bug fixes & others"),
    IOS_MIN_APP_VERSION_CODE: Joi.number().default(1),

    // Settings
    CURRENCIES_ALLOWED: Joi.string().default("ngn,usd,ghs"),
    TRIAL_COURSE_PERIOD_DAYS: Joi.number().default(14),
    MAX_CUSTOMER_REFERRAL_AMOUNT_NG: Joi.number().default(500000),
    MAX_CUSTOMER_REFERRAL_AMOUNT_US: Joi.number().default(200),
    MAX_CUSTOMER_REFERRAL_AMOUNT_GH: Joi.number().default(4000),

    OPENAI_API_KEY: Joi.string(),
    CLAUDE_API_KEY: Joi.string(),
    META_API_KEY: Joi.string(),
    PROXY_URL: Joi.string().trim(),
    AES_CONSTANT_ENC_IV: Joi.string().trim(),
    DISABLE_CBT_EXAM: Joi.bool().default(false),
    USE_OR_FOR_MULTIPLE_SELECTION: Joi.bool().default(false),

    AI_PROVIDER: Joi.string().default("gemini"), // "gemini" | "gpt" | "claude"
    AI_MERGE_IMAGE_PROMPT: Joi.bool().default(false),
    CACHE_AI_RESPONSE: Joi.bool().default(true),
    USE_AI_CHAT_STREAMING: Joi.bool().default(true),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default Object.freeze({
  ...process.env,
  env: envVars.NODE_ENV,
  API_BASE_URL: envVars.API_BASE_URL,
  USER_CLIENT_URL: envVars.USER_CLIENT_URL,
  ADMIN_CLIENT_URL: envVars.ADMIN_CLIENT_URL,
  PORT: envVars.PORT,
  REGION: envVars.REGION,
  AWS_ACCESS_KEY_ID: envVars.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY,
  NODE_ENV: envVars.NODE_ENV,
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES_IN: `${envVars.JWT_ACCESS_EXPIRATION_MINUTES}m`,
  DB_NAME: envVars.DB_NAME,
  DB_USERNAME: envVars.DB_USERNAME,
  DB_PASSWORD: envVars.DB_PASSWORD,
  DB_HOST: envVars.DB_HOST,
  DB_PORT: envVars.DB_PORT,
  DB_ENABLE_SSL: envVars.DB_ENABLE_SSL,
  DB_REJECT_UNAUTHORIZED_SSL: envVars.DB_REJECT_UNAUTHORIZED_SSL,

  USE_OPENSEARCH: envVars.USE_OPENSEARCH,
  USE_CACHE: envVars.USE_CACHE,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpires: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpires: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  jwtAdmin: {
    secret: envVars.JWT_SECRET_ADMIN,
    accessExpires: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpires: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  AWS_S3_BUCKET_NAME: envVars.AWS_S3_BUCKET_NAME,
  AWS_REGION: envVars.AWS_REGION,
  AWS_S3_DISTRIBUTION: envVars.AWS_S3_DISTRIBUTION,
  CLOUDFRONT_ASSETS: envVars.CLOUDFRONT_ASSETS,
  AWS_S3_IMAGE_UPLOAD_PATH: envVars.AWS_S3_IMAGE_UPLOAD_PATH,
  AWS_S3_VIDEO_UPLOAD_PATH: envVars.AWS_S3_VIDEO_UPLOAD_PATH,
  AWS_S3_PDF_UPLOAD_PATH: envVars.AWS_S3_PDF_UPLOAD_PATH,
  AWS_S3_ZIP_UPLOAD_PATH: envVars.AWS_S3_ZIP_UPLOAD_PATH,
  AWS_S3_ICS_UPLOAD_PATH: envVars.AWS_S3_ICS_UPLOAD_PATH,
  AWS_S3_OTHERS_UPLOAD_PATH: envVars.AWS_S3_OTHERS_UPLOAD_PATH,
  AWS_S3_ACCESS_KEY_ID: envVars.AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY: envVars.AWS_S3_SECRET_ACCESS_KEY,
  AWS_SES_ACCESS_KEY_ID: envVars.AWS_SES_ACCESS_KEY_ID,
  AWS_SES_SECRET_ACCESS_KEY: envVars.AWS_SES_SECRET_ACCESS_KEY,
  AWS_SES_DEFAULT_SEND_FROM: envVars.AWS_SES_DEFAULT_SEND_FROM,
  AWS_AI_ACCESS_KEY_ID: envVars.AWS_AI_ACCESS_KEY_ID,
  AWS_AI_SECRET_ACCESS_KEY: envVars.AWS_AI_SECRET_ACCESS_KEY,
  minio: {
    baseUrl: envVars.MINIO_BASE_URL,
    username: envVars.MINIO_USERNAME,
    password: envVars.MINIO_PASSWORD,
  },
  opensearch: {
    node: envVars.OPENSEARCH_NODE,
    username: envVars.OPENSEARCH_USERNAME,
    password: envVars.OPENSEARCH_PASSWORD,
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  USE_REDIS_TLS: envVars.USE_REDIS_TLS,
  REDIS_URL: envVars.REDIS_URL,
  EMAIL_TEST: envVars.EMAIL_TEST,
  EMAIL_TEST_APP_PASSWORD: envVars.EMAIL_TEST_APP_PASSWORD,
  USE_GMAIL_SMTP: envVars.USE_GMAIL_SMTP,

  FLW_SECRET_KEY: envVars.FLW_SECRET_KEY,
  FLW_SECRET_HASH: envVars.FLW_SECRET_HASH,

  WITHDRAWAL_TRANSACTION_FEE: envVars.WITHDRAWAL_TRANSACTION_FEE,

  SQUAD_SECRET_KEY: envVars.SQUAD_SECRET_KEY,
  PAYSTACK_SECRET_KEY: envVars.PAYSTACK_SECRET_KEY,

  pusher: {
    app_id: envVars.PUSHER_APP_ID,
    key: envVars.PUSHER_KEY,
    secret: envVars.PUSHER_SECRET,
    cluster: envVars.PUSHER_CLUSTER,
  },

  SERVICE_LAMBDA_ROLE: envVars.SERVICE_LAMBDA_ROLE,
  API_LAMBDA_ARN: envVars.API_LAMBDA_ARN,
  JOB_LAMBDA_ARN: envVars.JOB_LAMBDA_ARN,
  EVENT_SCHEDULAR_GROUP_NAME: envVars.EVENT_SCHEDULAR_GROUP_NAME,
  SNS_TOPIC_NAME: envVars.SNS_TOPIC_NAME,
  SNS_TOPIC_ARN: envVars.SNS_TOPIC_ARN,
  SQS_QUEUE_URL: envVars.SQS_QUEUE_URL,
  SQS_QUEUE_ARN: envVars.SQS_QUEUE_ARN,

  SLACK_AUTH_TOKEN: envVars.SLACK_AUTH_TOKEN,
  SLACK_GENERIC_CHANNEL_ID: envVars.SLACK_GENERIC_CHANNEL_ID,
  SLACK_ERROR_CHANNEL_ID: envVars.SLACK_ERROR_CHANNEL_ID,
  SLACK_DEV_CHANNEL_ID: envVars.SLACK_DEV_CHANNEL_ID,

  RSA_PUBLIC_KEY_HTTP_REQEUST: envVars.RSA_PUBLIC_KEY_HTTP_REQEUST,
  RSA_PRIVATE_KEY_HTTP_REQEUST: envVars.RSA_PRIVATE_KEY_HTTP_REQEUST,
  RSA_PUBLIC_KEY_HTTP_REQEUST_MOBILE: envVars.RSA_PUBLIC_KEY_HTTP_REQEUST_MOBILE,
  RSA_PRIVATE_KEY_HTTP_REQEUST_MOBILE: envVars.RSA_PRIVATE_KEY_HTTP_REQEUST_MOBILE,

  ENABLE_CSRF_TOKEN: envVars.ENABLE_CSRF_TOKEN,
  CSRF_TOKEN_EXPIRES_SECS: envVars.CSRF_TOKEN_EXPIRES_SECS,

  // Whatsapp
  WA_API_VERSION: envVars.WA_API_VERSION,
  WA_API_PHONE_NUMBER_ID: envVars.WA_API_PHONE_NUMBER_ID,
  WA_API_ACCESS_TOKEN: envVars.WA_API_ACCESS_TOKEN,

  SMS_CHANNEL: envVars.SMS_CHANNEL as "termii",
  TERMII_API_KEY: envVars.TERMII_API_KEY,

  GOOGLE_AUTH_KEY_API: (() => {
    const account = envVars.GOOGLE_AUTH_KEY_API_ACCOUNT;
    const chibbaaProd = envVars.GOOGLE_AUTH_KEY_API_CHIBBAA_PROD;
    const iclassDev = envVars.GOOGLE_AUTH_KEY_API_WINZY_DEV;
    const iclassProd = envVars.GOOGLE_AUTH_KEY_API_WINZY_PROD;

    if (account === "chibbaa-prod" && chibbaaProd) {
      return chibbaaProd;
    }

    if (account === "iclass-dev" && iclassDev) {
      return iclassDev;
    }
    if (account === "iclass-prod" && iclassProd) {
      return iclassProd;
    }

    return envVars.GOOGLE_AUTH_KEY_API;
  })(),

  GOOGLE_GEMINI_KEY: envVars.GOOGLE_GEMINI_KEY,

  GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envVars.GOOGLE_CLIENT_SECRET,

  TWITTER_CLIENT_ID: envVars.TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET: envVars.TWITTER_CLIENT_SECRET,
  GITHUB_CLIENT_ID: envVars.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: envVars.GITHUB_CLIENT_SECRET,

  APPLE_AUTH_KEY: envVars.APPLE_AUTH_KEY,

  paymentChannels: {
    web: envVars.PAYMENT_CHANNEL_WEB,
    mobile: envVars.PAYMENT_CHANNEL_MOBILE,
  },
  appUpdates: {
    android: {
      versionCode: envVars.ANDROID_APP_VERSION_CODE,
      versionName: envVars.ANDROID_APP_VERSION_NAME,
      versionChanges: envVars.ANDROID_APP_VERSION_CHANGES,
      minVersionCode: envVars.ANDROID_MIN_APP_VERSION_CODE,
    },
    ios: {
      versionCode: envVars.IOS_APP_VERSION_CODE,
      versionName: envVars.IOS_APP_VERSION_NAME,
      versionChanges: envVars.IOS_APP_VERSION_CHANGES,
      minVersionCode: envVars.IOS_MIN_APP_VERSION_CODE,
    },
  },

  // Settings
  CURRENCIES_ALLOWED: envVars.CURRENCIES_ALLOWED as string,
  TRIAL_COURSE_PERIOD_DAYS: envVars.TRIAL_COURSE_PERIOD_DAYS as number,
  MAX_CUSTOMER_REFERRAL_AMOUNT_NG: envVars.MAX_CUSTOMER_REFERRAL_AMOUNT_NG as number,
  MAX_CUSTOMER_REFERRAL_AMOUNT_US: envVars.MAX_CUSTOMER_REFERRAL_AMOUNT_US as number,
  MAX_CUSTOMER_REFERRAL_AMOUNT_GH: envVars.MAX_CUSTOMER_REFERRAL_AMOUNT_GH as number,

  OPENAI_API_KEY: envVars.OPENAI_API_KEY,
  CLAUDE_API_KEY: envVars.CLAUDE_API_KEY,
  META_API_KEY: envVars.META_API_KEY,
  PROXY_URL: envVars.PROXY_URL,
  AES_CONSTANT_ENC_IV: envVars.AES_CONSTANT_ENC_IV,
  DISABLE_CBT_EXAM: envVars.DISABLE_CBT_EXAM,
  USE_OR_FOR_MULTIPLE_SELECTION: envVars.USE_OR_FOR_MULTIPLE_SELECTION,

  AI_PROVIDER: envVars.AI_PROVIDER,
  AI_MERGE_IMAGE_PROMPT: envVars.AI_MERGE_IMAGE_PROMPT,
  CACHE_AI_RESPONSE: envVars.CACHE_AI_RESPONSE,
  USE_AI_CHAT_STREAMING: envVars.USE_AI_CHAT_STREAMING,
});
