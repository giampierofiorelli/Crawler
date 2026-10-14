-- Phase 72: non-content audit of authorised transient acquisitions (RESEARCH ONLY).
-- Apply after 001-006. NOT validated against a running PostgreSQL server.
-- Specifically NO article text, model prompt/completion, excerpts, HTML or embeddings.
BEGIN;
CREATE TABLE IF NOT EXISTS structured_acquisition_run (
 id TEXT PRIMARY KEY,
 source_id TEXT NOT NULL REFERENCES source_publisher(id),
 rights_grant_id TEXT NOT NULL REFERENCES rights_grant(id),
 variant_id TEXT NOT NULL REFERENCES product_variant(id),
 category_id TEXT NOT NULL,
 schema_version INTEGER NOT NULL,
 source_url TEXT NOT NULL CHECK(source_url LIKE 'https://%'),
 source_sha256 CHAR(64) CHECK(source_sha256 ~ '^[0-9a-f]{64}$'),
 adapter_kind TEXT NOT NULL CHECK(adapter_kind IN ('bounded_numeric_table','local_semantic_proposal')),
 status TEXT NOT NULL CHECK(status IN ('quarantined','blocked','rejected')),
 sampled_rows INTEGER NOT NULL DEFAULT 0 CHECK(sampled_rows BETWEEN 0 AND 50),
 total_rows INTEGER NOT NULL DEFAULT 0 CHECK(total_rows >= 0),
 rejected_candidates INTEGER NOT NULL DEFAULT 0 CHECK(rejected_candidates BETWEEN 0 AND 50),
 check_time TIMESTAMPTZ NOT NULL,
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 FOREIGN KEY(category_id,schema_version) REFERENCES evidence_category_schema(category_id,schema_version),
 CHECK(status <> 'quarantined' OR source_sha256 IS NOT NULL),
 CHECK(sampled_rows <= total_rows OR adapter_kind='local_semantic_proposal'),
 UNIQUE(source_id,variant_id,source_url,source_sha256,adapter_kind,check_time)
);
CREATE INDEX IF NOT EXISTS ix_structured_acquisition_variant_recent ON structured_acquisition_run(variant_id,check_time DESC);
CREATE TABLE IF NOT EXISTS structured_acquisition_output (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 acquisition_id TEXT NOT NULL REFERENCES structured_acquisition_run(id),
 kind TEXT NOT NULL CHECK(kind IN ('quarantined_observation','quarantined_schema_signal')),
 observation_id TEXT REFERENCES structured_evidence_observation(id),
 signal_id TEXT REFERENCES adaptive_schema_signal(id),
 CHECK((kind='quarantined_observation' AND observation_id IS NOT NULL AND signal_id IS NULL) OR
       (kind='quarantined_schema_signal' AND signal_id IS NOT NULL AND observation_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_acquisition_observation_unique
 ON structured_acquisition_output(acquisition_id,observation_id) WHERE observation_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ix_acquisition_signal_unique
 ON structured_acquisition_output(acquisition_id,signal_id) WHERE signal_id IS NOT NULL;
-- An existing run must not be silently deleted/replayed when source rights are revoked.
-- Rights revocation and trusted immutable writes will be enforced by a later DB role policy.
COMMIT;
