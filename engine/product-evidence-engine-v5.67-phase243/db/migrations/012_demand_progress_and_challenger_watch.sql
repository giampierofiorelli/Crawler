-- Phase 77. PROPOSED additive PostgreSQL schema; not applied to a live database.
-- Does not contain raw user prompts, scraped articles, personal contact details or inferred scores.
-- Do not make public endpoints for reviewer receipts, signal promotion or job state changes.
BEGIN;
CREATE TABLE IF NOT EXISTS functional_demand_request (
  request_id TEXT PRIMARY KEY CHECK(request_id ~ '^req_[0-9a-f]{32}$'),
  demand_scope_sha256 CHAR(64) NOT NULL UNIQUE CHECK(demand_scope_sha256 ~ '^[a-f0-9]{64}$'),
  demand_mode TEXT NOT NULL CHECK(demand_mode IN (
    'functional_discovery','specific_product','category_comparison')),
  approved_result_id TEXT, approved_review_id TEXT,
  next_scheduled_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((approved_result_id IS NULL)=(approved_review_id IS NULL))
);
CREATE TABLE IF NOT EXISTS functional_demand_access (
  request_id TEXT REFERENCES functional_demand_request(request_id) ON DELETE CASCADE,
  token_sha256 CHAR(64) NOT NULL CHECK(token_sha256 ~ '^[a-f0-9]{64}$'),
  PRIMARY KEY(request_id,token_sha256)
);
CREATE TABLE IF NOT EXISTS functional_demand_stage (
  request_id TEXT REFERENCES functional_demand_request(request_id) ON DELETE CASCADE,
  stage_order SMALLINT NOT NULL CHECK(stage_order BETWEEN 0 AND 6),
  stage_key TEXT NOT NULL CHECK(stage_key IN (
    'goal_review','solution_family_mapping','source_permissions','candidate_discovery',
    'method_and_safety_review','candidate_evidence','comparative_quality_review')),
  stage_state TEXT NOT NULL DEFAULT 'not_started' CHECK(stage_state IN (
    'not_started','working','verified','blocked')),
  receipt_id TEXT, verified_at TIMESTAMPTZ,
  PRIMARY KEY(request_id,stage_order),
  UNIQUE(request_id,stage_key),
  CHECK ((stage_state='verified')=(receipt_id IS NOT NULL AND verified_at IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS functional_demand_challenger_signal (
  signal_id TEXT PRIMARY KEY CHECK(signal_id ~ '^[a-z][a-z0-9_]{0,119}$'),
  product_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  original_test_id TEXT,
  source_reference_id TEXT NOT NULL,
  scope_sha256 CHAR(64) NOT NULL CHECK(scope_sha256 ~ '^[a-f0-9]{64}$'),
  triage_action TEXT NOT NULL CHECK(triage_action IN (
    'blocked_source','duplicate_evidence','metadata_watch','targeted_evidence_collection')),
  ranking_change_permitted BOOLEAN NOT NULL DEFAULT false CHECK(ranking_change_permitted=false),
  observed_at TIMESTAMPTZ NOT NULL,
  UNIQUE(scope_sha256,signal_id)
);
CREATE INDEX IF NOT EXISTS ix_functional_demand_unfinished
  ON functional_demand_request(updated_at)
  WHERE approved_result_id IS NULL;
CREATE INDEX IF NOT EXISTS ix_functional_demand_challenger
  ON functional_demand_challenger_signal(scope_sha256,observed_at DESC);
COMMIT;
