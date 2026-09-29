# Agent Runtime Platform

A durable-execution, sandboxed runtime for running coding agents in production: agents that write, test and deploy integration code. A control plane (TypeScript) persists every run to PostgreSQL so work survives restarts (durable execution), executes each agent step in an isolated, locked-down Docker sandbox, and emits OpenTelemetry traces. Ships as a self-hostable, single-tenant deployment.

Maintained by nrobertio. A generic, public reference for agent-infrastructure and platform work: durable execution, sandboxed compute, self-hostable single-tenant delivery, and observability.

## What this demonstrates

- Durable execution: run state (runs, steps, events) is persisted to PostgreSQL, so a crash or restart resumes instead of losing work.
- Sandboxed compute: each agent step runs in an isolated Docker container, non-root, read-only root filesystem, no network by default, with CPU and memory caps.
- Self-hostable single-tenant: one docker-compose brings up the whole platform for a single customer, as a first-class product shape.
- Observability: OpenTelemetry tracing across the control plane and each run.
- Stack: TypeScript, PostgreSQL, Docker, deployable on AWS.

## Layout

```
control-plane/   TypeScript API + durable execution engine + sandbox launcher
db/schema.sql    runs, steps and events tables
sandbox/         the locked-down execution image
deploy/          docker-compose for self-hosted single-tenant
docs/            PROJECT.md and ARCHITECTURE.md
```

## Run it (self-hosted)

```
cd deploy
docker compose up --build
```

## License

MIT. See LICENSE.
