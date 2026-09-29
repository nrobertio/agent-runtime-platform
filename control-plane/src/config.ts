// Central configuration, read from the environment.
export const config = {
  apiPort: Number(process.env.API_PORT ?? 3000),
  bindAddress: process.env.BIND_ADDRESS ?? "0.0.0.0",
  db: {
    host: process.env.PGHOST ?? "postgres",
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? "agent",
    password: process.env.PGPASSWORD ?? "agent",
    database: process.env.PGDATABASE ?? "agent",
  },
  sandboxImage: process.env.SANDBOX_IMAGE ?? "agent-sandbox:latest",
  stepTimeoutMs: Number(process.env.STEP_TIMEOUT_MS ?? 60000),
};
