-- Phase 76 PROPOSED PostgreSQL schema. NOT executed in this environment.
-- Atomic request claims should use SELECT ... FOR UPDATE SKIP LOCKED in production.
-- No raw user utterances, article text, inferred product scores or LLM output.
BEGIN;
CREATE TABLE IF NOT EXISTS consumer_research_request (
  request_id TEXT PRIMARY KEY CHECK(request_id ~ '^req_[0-9a-f]{32}$'),
  scope_sha256 CHAR(64) NOT NULL UNIQUE CHECK(scope_sha256 ~ '^[0-9a-f]{64}$'),
  category_id TEXT NOT NULL CHECK(category_id ~ '^[a-z][a-z0-9_]{0,119}$'),
  category_label TEXT NOT NULL CHECK(length(category_label) BETWEEN 1 AND 90),
  product_label TEXT CHECK(product_label IS NULL OR length(product_label) BETWEEN 1 AND 100),
  use_case_key TEXT NOT NULL CHECK(use_case_key ~ '^[a-z][a-z0-9_]{0,59}$'),
  request_status TEXT NOT NULL DEFAULT 'queued' CHECK(request_status IN (
    'queued','researching','awaiting_research_capacity','awaiting_independent_review',
    'insufficient_evidence','temporarily_unavailable','unable_to_complete','ready')),
  attempts SMALLINT NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 100),
  lease_sha256 CHAR(64) CHECK(lease_sha256 IS NULL OR lease_sha256 ~ '^[0-9a-f]{64}$'),
  lease_until TIMESTAMPTZ,
  next_allowed_at TIMESTAMPTZ,
  task_ids JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(task_ids)='array'),
  research_reference_ids JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(research_reference_ids)='array'),
  approved_result_id TEXT,
  independent_review_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((request_status='researching')=(lease_sha256 IS NOT NULL AND lease_until IS NOT NULL)),
  CHECK ((request_status='ready')=(approved_result_id IS NOT NULL AND independent_review_reference IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ix_consumer_research_claim
 ON consumer_research_request(request_status,next_allowed_at,created_at)
 WHERE request_status IN ('queued','researching','temporarily_unavailable','awaiting_research_capacity');
CREATE TABLE IF NOT EXISTS consumer_research_access (
  request_id TEXT NOT NULL REFERENCES consumer_research_request(request_id) ON DELETE CASCADE,
  access_sha256 CHAR(64) NOT NULL CHECK(access_sha256 ~ '^[0-9a-f]{64}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(request_id,access_sha256)
);
-- The approved_result_id must be resolved through an authenticated,
-- separately audited quality/independence check, not by this SQL schema alone.
COMMIT;
