-- Phase 75: proposed PostgreSQL representation for gap and discovery metadata.
-- RESEARCH ONLY; has NOT been executed in this environment.
-- Requires migration 008 (and all earlier migrations). No source bodies, LLM
-- prompts, model completions, saved HTML, article excerpts or embeddings.
BEGIN;
CREATE TABLE IF NOT EXISTS category_research_gap_queue (
 id TEXT PRIMARY KEY CHECK(id ~ '^[a-z][a-z0-9_]{0,119}$'),
 workspace_id TEXT NOT NULL REFERENCES category_research_workspace(id),
 gap_class TEXT NOT NULL CHECK(gap_class IN ('unknown_category','safety_uncertainty',
  'method_uncertainty','poor_coverage','stale_evidence','user_decision_uncertainty')),
 severity SMALLINT NOT NULL CHECK(severity BETWEEN 0 AND 3),
 affected_uses INTEGER NOT NULL DEFAULT 0 CHECK(affected_uses >= 0),
 distinct_original_test_count INTEGER NOT NULL DEFAULT 0 CHECK(distinct_original_test_count >= 0),
 source_ids JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(source_ids)='array'),
 rights_status TEXT NOT NULL CHECK(rights_status IN ('cleared_for_discovery','unknown','blocked')),
 evidence_checked_at TIMESTAMPTZ,
 next_allowed_at TIMESTAMPTZ,
 observed_at TIMESTAMPTZ NOT NULL,
 status TEXT NOT NULL DEFAULT 'proposed' CHECK(status IN ('proposed','in_research','needs_review','retired')),
 published BOOLEAN NOT NULL DEFAULT FALSE CHECK(published=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE)
);
CREATE INDEX IF NOT EXISTS ix_gap_queue_priorities ON category_research_gap_queue(workspace_id,status,gap_class,observed_at DESC);
CREATE TABLE IF NOT EXISTS category_research_priority_cycle (
 run_id TEXT PRIMARY KEY CHECK(run_id ~ '^[a-z][a-z0-9_]{0,119}$'),
 workspace_id TEXT NOT NULL REFERENCES category_research_workspace(id),
 as_of TIMESTAMPTZ NOT NULL,
 priority_rule_version INTEGER NOT NULL DEFAULT 1 CHECK(priority_rule_version > 0),
 selected_task_ids JSONB NOT NULL CHECK(jsonb_typeof(selected_task_ids)='array'),
 journal_revision BIGINT NOT NULL CHECK(journal_revision >= 0),
 review_status TEXT NOT NULL DEFAULT 'pending_independent_review' CHECK(review_status IN (
  'pending_independent_review','reviewed_research_only','rejected')),
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE)
);
CREATE TABLE IF NOT EXISTS category_authorized_sitemap_discovery (
 run_id TEXT PRIMARY KEY CHECK(run_id ~ '^[a-z][a-z0-9_]{0,119}$'),
 source_id TEXT NOT NULL REFERENCES source_publisher(id),
 rights_grant_id TEXT NOT NULL REFERENCES rights_grant(id),
 sitemap_url TEXT NOT NULL CHECK(sitemap_url LIKE 'https://%' AND length(sitemap_url)<=1500),
 checked_at TIMESTAMPTZ NOT NULL,
 discovery_status TEXT NOT NULL CHECK(discovery_status IN ('candidate_urls_found','blocked','nothing_relevant')),
 candidate_count INTEGER NOT NULL CHECK(candidate_count BETWEEN 0 AND 100),
 article_text_stored BOOLEAN NOT NULL DEFAULT FALSE CHECK(article_text_stored=FALSE)
);
CREATE TABLE IF NOT EXISTS category_discovered_link (
 run_id TEXT NOT NULL REFERENCES category_authorized_sitemap_discovery(run_id),
 url TEXT NOT NULL CHECK(url LIKE 'https://%' AND length(url)<=1500),
 review_status TEXT NOT NULL DEFAULT 'unverified_metadata' CHECK(review_status IN (
 'unverified_metadata','source_qualified','rejected')),
 page_retrieval_authorized BOOLEAN NOT NULL DEFAULT FALSE CHECK(page_retrieval_authorized=FALSE),
 original_test_verified BOOLEAN NOT NULL DEFAULT FALSE CHECK(original_test_verified=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 PRIMARY KEY(run_id,url)
);
COMMIT;
