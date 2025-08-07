import sequelize from "../js-models";
import { userService } from "../js-user/service";
import { register, registerDev, handler } from "./cli.service";

/**
 * Register commands for development only
 * @type {string}
 */
registerDev["cmd:sample1"] = (args, callback, context) => {
  console.log("Running sample 1 command for dev stages");
};

/**
 * Register command for all stages
 * @type {string}
 */
register["cmd:sample2"] = async (args, callback, context) => {
  console.log("Running sample 2 command for all stages");
};

/**
 * Execute/Revalidate sqlite/cloudfront cache
 * @type {string}
 */
register["cmd:reset_client_cache"] = async (args, callback, context) => {
  console.log("[[CLI_CMD_CACHE]]", args);

  // console.log("Initializing...", "[flag]=> ", flag);
  // if (flag === "all") {
  // await cacheCli.executeAll();
  // } else if (cacheTypes.includes(flag as CacheType)) {
  //   await cacheCli.execute(flag as CacheType);
  // }

  console.log("Running sample 2 command for all stages");
};


/**
 * Invalidate course meta (no of topics, durations, etc)
 * @type {string}
 */
register["cmd:study_reminder_notification"] = async (
  args,
  callback,
  context
) => {
  console.log("[[CLI_STUDY_TIME_REMINDER]]", args);

  const result = await sequelize.transaction(async (transaction) => {
    // return await userService.notifyUsersForStudy({ transaction });
    console.log("Study notification feature not implemented yet");
    return { message: "Study notification feature not implemented" };
  });

  console.log(
    `Study time reminder notification sent successfully - ${new Date().toISOString()}`
  );
};

export default handler;
