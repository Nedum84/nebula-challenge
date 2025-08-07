import sequelize from "../js-models";
import path from "path";
import config from "../config/config";
import { execCommand } from "./exec.cmd";
import postMigration from "../database/post-migrations";

// Sequelize cli path
const sCli = path.resolve(__dirname, "../../node_modules/sequelize-cli/lib/sequelize");

const dropDB = async () => {
  try {
    return await execCommand(`${sCli} db:drop --force`);
  } catch (e) {
    console.log(e);
    // try {
    //   // Force database drop
    //   await sequelize.query(
    //     `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${config.DB_NAME}';`
    //   );
    // } catch (error) {
    // console.log(error);
    await sequelize.dropAllSchemas({});
    return await sequelize.getQueryInterface().dropAllTables();
    // }
  }
};

const dbCreate = () => execCommand(`${sCli} db:create`, null, false);
const dbMigrate = () => execCommand(`${sCli} db:migrate --debug`);

const dbPostMigrate = (args: any, callback: any) =>
  postMigration()
    .then(async () => {
      callback(null, "done");
    })
    .catch((err) => console.error(err));

const dbSeedAll = () => execCommand(`${sCli} db:seed:all`);
const dbSync = () => sequelize.sync({ force: true });
const bash = (args: any) =>
  args.cmd ? execCommand(`${args.cmd}`) : console.log("cmd parameter is required");

const handler = async function (event: any, context: any, callback: any) {
  const env = config.NODE_ENV;

  console.log("Arguments: ", event);
  const command = typeof event === "string" ? event : event.fn;
  console.log(`Running "${command}" in ${env} mode.`);

  let handle;
  if (["development", "staging", "test"].includes(env!)) {
    const all = { ...register, ...registerDev };
    handle = all[command];
  } else {
    handle = register[command];
  }

  try {
    let res = "";
    if (handle) {
      res = await handle(event, callback, context);
    } else {
      console.log(`Command ${command} not found in environment ${env}`);
    }

    callback(null, res);
  } catch (e) {
    callback(e);
    process.exit(1);
  }
};

const register = {
  "db:migrate": dbMigrate,
  "db:create": dbCreate,
  "db:post:migrate": dbPostMigrate,
};

const registerDev = {
  "db:drop": dropDB,
  "db:seed:all": dbSeedAll,
  "db:sync": dbSync,
  bash,
};

export { register, registerDev, handler };
