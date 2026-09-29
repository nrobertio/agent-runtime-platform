// HTTP routes for the control plane, registered as a Fastify plugin.
import type { FastifyInstance } from "fastify";
import { createRun, getRun } from "./durable.js";

export async function routes(app: FastifyInstance): Promise<void> {
  app.get("/healthz", async () => ({ status: "ok" }));

  app.post("/runs", async (req, reply) => {
    const body = (req.body ?? {}) as { task?: string; repo?: string };
    if (!body.task) {
      return reply.code(400).send({ error: "field 'task' is required" });
    }
    const id = await createRun({ task: body.task, repo: body.repo });
    return reply.code(201).send({ id });
  });

  app.get("/runs/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = await getRun(id);
    if (!result.run) {
      return reply.code(404).send({ error: "not found" });
    }
    return result;
  });
}
