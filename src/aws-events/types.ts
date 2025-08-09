export enum AwsEventType {
  USER_CREATED = "user_created",
  USER_VERIFY_EMAIL = "user_verify_email",
  USER_REG_T10MINS = "user_reg_t_10mins",
  USER_REG_T60MINS = "user_reg_t_60mins",
  USER_REG_T1D = "user_reg_t_1d",
  USER_REG_T2D = "user_reg_t_2d",
  USER_REG_T7D = "user_reg_t_7d",
  USER_REG_T30D = "user_reg_t_30d",

  USER_RESET_PASSWORD = "user_reset_password",
}

export type AwsEventBody<T = Record<string, string | number | Date | any>> = {
  type: AwsEventType;
  payload: {
    id: string;
  } & T;
};
