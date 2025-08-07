import { app } from "./app";
import config from "./config/config";
import logger from "./config/logger";

//Start mongoose & event bus
const start = async () => {
  const server = app.listen(config.PORT, async () => {
    console.log(`Listening on http://localhost:${config.PORT}`);

    // DEV use only

    // index opensearch data
    // await productOpensearchService.reIndexAllProducts();
    // index redis data
  });
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info("Server closed");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error: any) => {
    logger.error(error);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received");
    if (server) {
      server.close();
    }
  });
  process.once("SIGUSR2", function () {
    process.kill(process.pid, "SIGUSR2");
  });

  process.on("SIGINT", function () {
    // this is only called on ctrl+c, not restart
    process.kill(process.pid, "SIGINT");
  });
};

start();
