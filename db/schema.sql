-- Durable execution state. The control plane never keeps run state only in
-- memory; every transition is written here so a restart can resume.

CREATE TABLE IF NOT EXISTS runs (
  id            UUID PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending, running, succeeded, failed
  input         JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS steps (
  id            UUID PRIMARY KEY,
  run_id        UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  seq           INT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  output        JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id            BIGSERIAL PRIMARY KEY,
  run_id        UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  detail        JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
CREATE INDEX IF NOT EXISTS idx_steps_run ON steps(run_id);
