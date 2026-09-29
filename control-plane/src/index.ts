// Control plane entrypoint: start tracing, register routes, resume any
// interrupted runs (durable execution), then accept requests.
import { startTelemetry } from "./otel.js";
startTelemetry();

import Fastify from "fastify";
import { config } from "./config.js";
import { routes } from "./api.js";
import { resumeInterrupted } from "./durable.js";

async function main(): Promise<void> {
  const app = Fastify({ logger: true });
  await app.register(routes);

  const interrupted = await resumeInterrupted();
  app.log.info({ interrupted }, "resumed interrupted runs on startup");

  await app.listen({ port: config.apiPort, host: config.bindAddress });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
