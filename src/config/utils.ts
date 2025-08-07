import { UserPayload } from "../middlewares";
import config from "./config";

export type UserConf = {
  payment_channel: "flw" | "paystack" | "squad";
  app_update_android: {
    app_version_code: number;
    app_version_name: string;
    app_version_changes: string;
    min_app_version_code: number;
  };
  app_update_ios: {
    app_version_code: number;
    app_version_name: string;
    app_version_changes: string;
    min_app_version_code: number;
  };
  use_ai_chat_streaming: boolean;
};

export const getUserConfig = async (params: {
  userId?: string;
  device?: any; // Simplified since device is not in our current UserPayload interface
}) => {
  const isDeviceWeb = params.device?.device_type === "web";
  const _config: UserConf = {
    payment_channel: isDeviceWeb ? config.paymentChannels.web : config.paymentChannels.mobile,
    app_update_android: {
      app_version_code: config.appUpdates.android.versionCode,
      app_version_name: config.appUpdates.android.versionName,
      app_version_changes: config.appUpdates.android.versionChanges,
      min_app_version_code: config.appUpdates.android.minVersionCode,
    },
    app_update_ios: {
      app_version_code: config.appUpdates.ios.versionCode,
      app_version_name: config.appUpdates.ios.versionName,
      app_version_changes: config.appUpdates.ios.versionChanges,
      min_app_version_code: config.appUpdates.ios.minVersionCode,
    },
    use_ai_chat_streaming: isDeviceWeb ? config.USE_AI_CHAT_STREAMING : false,
  };

  return _config;
};
