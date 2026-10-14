-- Phase 73: additive, RESEARCH-ONLY category intelligence / cold-start workspaces.
-- Not executed against a live database. Apply after 001-007, PostgreSQL 15+.
-- No scraped page text, prompts, completions, excerpt archives or embeddings.
-- The new tables are NEVER exposed to launch/ranking views.
BEGIN;
CREATE TABLE IF NOT EXISTS category_research_workspace (
 id TEXT PRIMARY KEY CHECK (id ~ '^[a-z][a-z0-9_]{0,119}$'),
 status TEXT NOT NULL CHECK (status IN ('provisional_research','review_pending','reviewed_research','retired')),
 is_known_category BOOLEAN NOT NULL DEFAULT FALSE,
 schema_version INTEGER CHECK (schema_version > 0),
 created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL CHECK (updated_at >= created_at),
 label_key TEXT NOT NULL CHECK (length(label_key) BETWEEN 1 AND 120),
 reviewed_by TEXT,
 review_reference TEXT,
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK (publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK (ranking_eligible=FALSE),
 CHECK (status <> 'reviewed_research' OR (reviewed_by IS NOT NULL AND review_reference IS NOT NULL AND schema_version IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_category_research_label ON category_research_workspace(label_key,id);
CREATE TABLE IF NOT EXISTS category_cognitive_task (
 id TEXT PRIMARY KEY,
 workspace_id TEXT NOT NULL REFERENCES category_research_workspace(id),
 capability TEXT NOT NULL CHECK (capability IN (
  'category_identity','use_case_research','failure_and_safety_research','variant_taxonomy',
  'source_landscape','source_rights_review','test_method_research','criterion_design',
  'source_acquisition','evidence_independence_audit','category_schema_review',
  'coverage_analysis','targeted_backfill','freshness_review','category_change_watch')),
 task_status TEXT NOT NULL CHECK (task_status IN ('planned','blocked','completed_verified','cancelled')),
 dependency_ids JSONB NOT NULL CHECK (jsonb_typeof(dependency_ids)='array'),
 evidence_reference_ids JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(evidence_reference_ids)='array'),
 completed_by TEXT,
 verified_reference TEXT,
 updated_at TIMESTAMPTZ NOT NULL,
 automatic_web_access_authorized BOOLEAN NOT NULL DEFAULT FALSE CHECK(automatic_web_access_authorized=FALSE),
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 UNIQUE(workspace_id,capability),
 CHECK(task_status <> 'completed_verified' OR (completed_by IS NOT NULL AND verified_reference IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS category_research_question (
 id TEXT PRIMARY KEY CHECK(id ~ '^[a-z][a-z0-9_]*$'),
 workspace_id TEXT NOT NULL REFERENCES category_research_workspace(id),
 question_key TEXT NOT NULL CHECK(question_key ~ '^[a-z][a-z0-9_]*$'),
 axis TEXT NOT NULL CHECK(axis IN ('user_outcomes','failure_modes','variant_boundaries',
  'measurement_methods','compatibility','source_landscape','decision_tradeoffs','safety_constraints')),
 context_tags JSONB NOT NULL CHECK(jsonb_typeof(context_tags)='array'),
 reason_reference_id TEXT NOT NULL,
 suggested_field_sha256 CHAR(64) CHECK(suggested_field_sha256 ~ '^[a-f0-9]{64}$'),
 research_status TEXT NOT NULL DEFAULT 'unverified_question'
   CHECK(research_status IN ('unverified_question','conflicting_hypotheses','reviewed_research')),
 created_at TIMESTAMPTZ NOT NULL,
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 UNIQUE(workspace_id,question_key,reason_reference_id,suggested_field_sha256)
);
CREATE TABLE IF NOT EXISTS category_criterion_proposal (
 id TEXT PRIMARY KEY,
 workspace_id TEXT NOT NULL REFERENCES category_research_workspace(id),
 criterion_key TEXT NOT NULL CHECK(criterion_key ~ '^[a-z][a-z0-9_]*$'),
 definition_sha256 CHAR(64) NOT NULL CHECK(definition_sha256 ~ '^[a-f0-9]{64}$'),
 definition_json JSONB NOT NULL CHECK(jsonb_typeof(definition_json)='object' AND
    NOT (definition_json ?| ARRAY['text','body','excerpt','raw_page','embedding','prompt','completion'])),
 proposal_status TEXT NOT NULL CHECK(proposal_status IN (
   'needs_more_evidence','research_schema_candidate','semantic_conflict','rejected','reviewed_research')),
 original_test_count INTEGER NOT NULL CHECK(original_test_count >= 0),
 source_count INTEGER NOT NULL CHECK(source_count >= 0),
 variant_count INTEGER NOT NULL CHECK(variant_count >= 0),
 reviewed_by TEXT,review_reference TEXT,
 created_at TIMESTAMPTZ NOT NULL,
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 UNIQUE(workspace_id,criterion_key,definition_sha256),
 CHECK(proposal_status <> 'reviewed_research' OR
   (reviewed_by IS NOT NULL AND review_reference IS NOT NULL AND original_test_count >= 2 AND source_count >= 2 AND variant_count >= 2))
);
CREATE TABLE IF NOT EXISTS category_research_evidence_reference (
 proposal_id TEXT NOT NULL REFERENCES category_criterion_proposal(id),
 original_test_id TEXT NOT NULL,
 variant_id TEXT NOT NULL,
 source_id TEXT NOT NULL REFERENCES source_publisher(id),
 rights_grant_id TEXT NOT NULL REFERENCES rights_grant(id),
 source_url TEXT NOT NULL CHECK(source_url LIKE 'https://%'),
 source_sha256 CHAR(64) NOT NULL CHECK(source_sha256 ~ '^[a-f0-9]{64}$'),
 anchor_sha256 CHAR(64) NOT NULL CHECK(anchor_sha256 ~ '^[a-f0-9]{64}$'),
 referenced_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY(proposal_id,original_test_id,variant_id,source_id,anchor_sha256)
);
-- Query indexes for category-scoped learning and maintenance, not for public scoring.
CREATE INDEX IF NOT EXISTS ix_category_cognitive_tasks_status ON category_cognitive_task(workspace_id,task_status);
CREATE INDEX IF NOT EXISTS ix_category_research_question ON category_research_question(workspace_id,axis,research_status);
CREATE INDEX IF NOT EXISTS ix_category_proposal_status ON category_criterion_proposal(workspace_id,proposal_status);
COMMIT;
