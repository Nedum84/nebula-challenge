import { register, registerDev, handler } from "./cli.service";

/**
 * Register commands for development only
 * @type {string}
 */
registerDev["cmd:sample1"] = (args, callback, context) => {
  console.log("Running sample 1 command for dev stages");
};

/**
 * Execute/Revalidate sqlite/cloudfront cache
 * @type {string}
 */
register["cmd:sample2"] = async (args, callback, context) => {
  console.log("Running sample 2 command for all stages");
};

export default handler;
