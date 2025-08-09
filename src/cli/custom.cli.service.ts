import { register, registerDev, handler } from "./cli.service";

registerDev["cmd:sample1"] = (args, callback, context) => {
  console.log("Running sample 1 command for dev stages");
};

register["cmd:sample2"] = async (args, callback, context) => {
  console.log("Running sample 2 command for all stages");
};

export default handler;
