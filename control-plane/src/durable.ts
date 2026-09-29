// Durable execution engine. A run is a sequence of steps; every transition is
// written to PostgreSQL before work proceeds, so a restart resumes cleanly.
import { randomUUID } from "node:crypto";
import { pool, withTx } from "./db.js";

export interface RunInput {
  task: string;
  repo?: string;
}

export async function createRun(input: RunInput): Promise<string> {
  const id = randomUUID();
  await pool.query("INSERT INTO runs (id, status, input) VALUES ($1, 'pending', $2)", [id, input]);
  await pool.query("INSERT INTO events (run_id, kind, detail) VALUES ($1, 'created', $2)", [id, input]);
  return id;
}

export async function getRun(id: string) {
  const runs = await pool.query("SELECT * FROM runs WHERE id = $1", [id]);
  const steps = await pool.query("SELECT * FROM steps WHERE run_id = $1 ORDER BY seq", [id]);
  return { run: runs.rows[0] ?? null, steps: steps.rows };
}

export async function recordStep(runId: string, seq: number, status: string, output: unknown) {
  await withTx(async (c) => {
    await c.query(
      "INSERT INTO steps (id, run_id, seq, status, output) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), runId, seq, status, output]
    );
    await c.query("UPDATE runs SET status = $2, updated_at = now() WHERE id = $1", [runId, status === "failed" ? "failed" : "running"]);
  });
}

// On startup, any run left in 'running' is resumed rather than lost.
export async function resumeInterrupted(): Promise<string[]> {
  const res = await pool.query("SELECT id FROM runs WHERE status = 'running'");
  return res.rows.map((r) => r.id as string);
}
