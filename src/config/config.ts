import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().default("development"),
    PORT: Joi.number().default(5500),
    
    // JWT Configuration
    JWT_SECRET: Joi.string().description("JWT secret key").default("jwt-token-secret"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(90)
      .description("days after which refresh tokens expire"),
    
    // AWS Configuration
    AWS_REGION: Joi.string().default("eu-west-2"),
    AWS_ACCESS_KEY_ID: Joi.string().default("AKIA474VTUGHK62Y2HHT"),
    AWS_SECRET_ACCESS_KEY: Joi.string().default("XCLmzk1X6TlvNkyRwI9CFq6ZmiEFdzixkX/wwVUI"),
    
    // AWS Cognito Configuration
    COGNITO_USER_POOL_ID: Joi.string().default("eu-north-1_example"),
    COGNITO_CLIENT_ID: Joi.string().default("54p32d5n5j5m2t0gt45e9og8vo"),
    COGNITO_CLIENT_SECRET: Joi.string().default("dnel7s515mgqk74rurtt1rhqsb0p21kgmu1nf1jdlcfvo04lvde"),
    
    // DynamoDB Configuration
    DYNAMODB_LEADERBOARD_TABLE: Joi.string().default("leaderboard"),
    DYNAMODB_LEADERBOARD_ARN: Joi.string().default("arn:aws:dynamodb:eu-north-1:893130088846:table/leaderboard"),
    
    // WebSocket Configuration
    WEBSOCKET_CONNECTION_URL: Joi.string().default("https://gdjtdhxwkf.execute-api.eu-north-1.amazonaws.com/production/@connections"),
    
    // AWS Lambda & Event Services
    SERVICE_LAMBDA_ROLE: Joi.string(),
    JOB_LAMBDA_ARN: Joi.string(),
    EVENT_SCHEDULAR_GROUP_NAME: Joi.string(),
    SNS_TOPIC_NAME: Joi.string(),
    SNS_TOPIC_ARN: Joi.string(),
    SQS_QUEUE_URL: Joi.string(),
    SQS_QUEUE_ARN: Joi.string(),

    // App Configuration (used in utils)
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
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  
  // JWT Configuration
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES_IN: `${envVars.JWT_ACCESS_EXPIRATION_MINUTES}m`,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpires: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpires: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  
  // AWS Configuration
  AWS_REGION: envVars.AWS_REGION,
  AWS_ACCESS_KEY_ID: envVars.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY,
  
  // AWS Cognito
  COGNITO_USER_POOL_ID: envVars.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: envVars.COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET: envVars.COGNITO_CLIENT_SECRET,
  
  // DynamoDB
  DYNAMODB_LEADERBOARD_TABLE: envVars.DYNAMODB_LEADERBOARD_TABLE,
  DYNAMODB_LEADERBOARD_ARN: envVars.DYNAMODB_LEADERBOARD_ARN,
  
  // WebSocket
  WEBSOCKET_CONNECTION_URL: envVars.WEBSOCKET_CONNECTION_URL,

  // AWS Lambda & Event Services
  SERVICE_LAMBDA_ROLE: envVars.SERVICE_LAMBDA_ROLE,
  JOB_LAMBDA_ARN: envVars.JOB_LAMBDA_ARN,
  EVENT_SCHEDULAR_GROUP_NAME: envVars.EVENT_SCHEDULAR_GROUP_NAME,
  SNS_TOPIC_NAME: envVars.SNS_TOPIC_NAME,
  SNS_TOPIC_ARN: envVars.SNS_TOPIC_ARN,
  SQS_QUEUE_URL: envVars.SQS_QUEUE_URL,
  SQS_QUEUE_ARN: envVars.SQS_QUEUE_ARN,

  // App Configuration
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

  USE_AI_CHAT_STREAMING: envVars.USE_AI_CHAT_STREAMING,
});