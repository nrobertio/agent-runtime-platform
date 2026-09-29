# Architecture

```
client
  |  POST /runs, GET /runs/:id
  v
control plane (TypeScript / Fastify)
  |-- durable execution: persist runs, steps, events to PostgreSQL
  |     (on startup, resume runs left in the running state)
  |-- sandbox launcher: one locked-down Docker container per step
  |     (no network, read-only rootfs, dropped capabilities, CPU/mem/PID caps)
  |-- OpenTelemetry tracing across the process and each run
  v
PostgreSQL (durable state)   +   Docker (isolated step execution)
```

## Components

- config.ts: environment-driven configuration.
- db.ts: PostgreSQL pool and a transaction helper.
- durable.ts: create/get runs, record steps, resume interrupted runs.
- sandbox.ts: launch a single step in an isolated container and capture its result.
- api.ts: HTTP routes (health, submit run, get run).
- index.ts: entrypoint that starts tracing, registers routes, resumes interrupted runs, then serves.

## Data model

- runs: one row per agent run, with status and input.
- steps: ordered steps within a run, each with status and output.
- events: an append-only log of what happened, for audit and debugging.

## Isolation model

Each step runs in the sandbox image with NetworkMode none, ReadonlyRootfs true, CapDrop ALL, a non-root user, and memory, CPU and PID limits. Agent-generated code therefore cannot reach the network, write the root filesystem, or exhaust the host.