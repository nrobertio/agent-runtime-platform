# Project Writeup: Agent Runtime Platform

Why this exists, how it was built, why each choice, benefits, and design trade-offs. Built to map to agent-infrastructure and platform roles: durable execution, sandboxed compute, self-hostable single-tenant delivery, and observability.

## 1. The problem it solves

Running AI agents that write, test and deploy code in production is not a chatbot problem, it is an infrastructure problem. Two hard requirements dominate: (1) the work must survive crashes and restarts (an agent run can take minutes and span many steps), and (2) agent-generated code must run somewhere isolated so it cannot damage the platform or reach things it should not. This project is a control plane that provides durable execution and a locked-down sandbox for each step.

## 2. How it was built

- Control plane (TypeScript, Fastify): an API to submit a run and query its state.
- Durable execution: every run and step transition is written to PostgreSQL before work proceeds. On startup the control plane resumes runs left in the running state instead of losing them.
- Sandbox: each step executes in a Docker container that is non-root, has a read-only root filesystem, no network, dropped Linux capabilities, and CPU, memory and PID caps.
- Observability: OpenTelemetry is initialized first so the process is traced.
- Self-hostable single-tenant: one docker-compose brings up PostgreSQL and the control plane for a single customer.

## 3. Why each choice

- Durable state in PostgreSQL, not in memory: an agent run is long and multi-step; keeping state only in memory means a restart loses everything. Persisting each transition makes runs resumable. This is the core idea behind durable-execution systems.
- Docker sandbox with network off and read-only rootfs: agent-generated code is untrusted by definition. The safe default is no network, no writable root, no capabilities, and hard resource caps, so a bad or hostile step is contained.
- TypeScript control plane: matches the ecosystem these platforms live in, and gives a typed API surface.
- Self-hostable single-tenant as a first-class shape: many customers require the platform to run inside their own boundary; single-tenant by compose makes that a product feature, not an afterthought.
- OpenTelemetry from the first import: you cannot operate agents at scale without traces across the control plane and each run.

## 4. Benefits

- Reliability: runs survive restarts and crashes rather than silently dying.
- Safety: untrusted agent code runs with no network, no writable root and capped resources.
- Portability: the whole platform self-hosts for one customer with a single command.
- Operability: traced end to end from day one.

## 5. Design notes and trade-offs

- Durable execution: why long-running agent work must persist each transition, and how resume-on-startup works (query runs in the running state, continue them).
- Sandbox threat model: agent code is untrusted; mitigations are no network, read-only rootfs, dropped capabilities, non-root, and CPU/memory/PID limits. What is still missing (seccomp/gVisor/Firecracker for stronger isolation) is the next step.
- Single-tenant vs multi-tenant: single-tenant simplifies the isolation and data-residency story at the cost of per-customer footprint; a plus for enterprise and regulated buyers.
- Where this would go next: stronger sandbox isolation (gVisor or Firecracker microVMs), a queue and worker pool for scale, step-level retries and idempotency keys, and per-tenant quotas.
- Honest scope: this is a reference implementation of the pattern, not a battle-tested product; the value is that it shows the right architecture and the right safety defaults.

## 6. How to run it

```
cd deploy
docker compose up --build
```
The control plane exposes POST /runs to submit a run and GET /runs/:id to inspect it. PostgreSQL holds durable state; each step would launch in the sandbox image.