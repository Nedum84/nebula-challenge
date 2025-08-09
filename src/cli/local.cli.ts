import handler from "./custom.cli.service.js";

const handle = async (commands: any[] = []) => {
  for await (const cmd of commands) {
    await handler(cmd, {}, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.warn(error);
        return;
      }

      if (stderr) {
        console.error(stderr);
        return;
      }

      console.log(stdout);
    });
  }
};

const args = process.argv.slice(2);

if (args[0] === "s:cli") {
  const commands = args.slice(1);
  handle(commands)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
} else {
  console.log("Usage: node cli/local.cli.js s:cli <command> [options]");
  process.exit(1);
}
