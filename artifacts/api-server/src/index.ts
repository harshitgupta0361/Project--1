import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["API_PORT"] || "5000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function listen(targetPort: number) {
  const server = app.listen(targetPort, () => {
    logger.info({ port: targetPort }, "Server listening");
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      logger.warn({ port: targetPort }, "Port is in use, trying next port...");
      listen(targetPort + 1);
    } else {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
  });
}

listen(port);
