-- Phase 74: additive audit journal for category research execution.
-- RESEARCH ONLY. Requires migration 008. NOT executed against a real database.
-- Records hashes, source identity and review status. Never store article bodies,
-- excerpts, model prompts, completions, embeddings or interpretation transcripts.
BEGIN;
CREATE TABLE IF NOT EXISTS category_research_execution (
  execution_id TEXT PRIMARY KEY CHECK (execution_id ~ '^[a-z][a-z0-9_]{0,119}$'),
  task_id TEXT NOT NULL REFERENCES category_cognitive_task(id),
  executed_at TIMESTAMPTZ NOT NULL,
  work_product_sha256 CHAR(64) NOT NULL CHECK(work_product_sha256 ~ '^[0-9a-f]{64}$'),
  execution_status TEXT NOT NULL CHECK(execution_status IN (
    'awaiting_independent_review','rejected_by_reviewer','reviewed_research_only')),
  independently_reviewed_by TEXT,
  independent_review_reference TEXT,
  publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
  ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
  CHECK(execution_status='awaiting_independent_review' OR
    (independently_reviewed_by IS NOT NULL AND independent_review_reference IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ix_category_research_execution_pending
 ON category_research_execution(task_id,execution_status,executed_at);
CREATE TABLE IF NOT EXISTS category_research_execution_reference (
  execution_id TEXT NOT NULL REFERENCES category_research_execution(execution_id),
  reference_id TEXT NOT NULL CHECK(reference_id ~ '^[a-z][a-z0-9_]{0,119}$'),
  source_id TEXT NOT NULL CHECK(source_id ~ '^[a-z][a-z0-9_]{0,119}$'),
  source_url TEXT NOT NULL CHECK(source_url LIKE 'https://%' AND length(source_url) <= 1500),
  document_sha256 CHAR(64) NOT NULL CHECK(document_sha256 ~ '^[0-9a-f]{64}$'),
  observed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY(execution_id,reference_id)
);
CREATE TABLE IF NOT EXISTS category_cold_start_intake_run (
  intake_id TEXT PRIMARY KEY CHECK(intake_id ~ '^[a-z][a-z0-9_]{0,119}$'),
  workspace_id TEXT NOT NULL REFERENCES category_research_workspace(id),
  source_acquisition_task_id TEXT NOT NULL REFERENCES category_cognitive_task(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  source_count INTEGER NOT NULL CHECK(source_count BETWEEN 0 AND 20),
  successfully_read_count INTEGER NOT NULL CHECK(successfully_read_count BETWEEN 0 AND source_count),
  quarantined_candidate_count INTEGER NOT NULL CHECK(quarantined_candidate_count >= 0),
  blueprint_sha256 CHAR(64) NOT NULL CHECK(blueprint_sha256 ~ '^[0-9a-f]{64}$'),
  reviewed_by TEXT,
  reviewer_reference TEXT,
  research_status TEXT NOT NULL CHECK(research_status IN
    ('unreviewed_quarantine','reviewed_research_only','rejected')),
  publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
  ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
  CHECK(research_status='unreviewed_quarantine' OR
    (reviewed_by IS NOT NULL AND reviewer_reference IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ix_cold_start_intake_workspace
 ON category_cold_start_intake_run(workspace_id,recorded_at DESC);
COMMIT;
