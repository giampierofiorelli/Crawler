-- Phase 70: RESEARCH-ONLY controlled extensible category evidence matrix.
-- Apply after 001-004; NOT verified on a live PostgreSQL 15+ server.
-- No original article body, text excerpt, AI-generated prose, or content embedding columns.
-- Data supplied through an external reviewed intake; never automatic publication/ranking.
BEGIN;
CREATE TABLE IF NOT EXISTS evidence_category_schema (
 category_id TEXT NOT NULL,
 schema_version INTEGER NOT NULL CHECK(schema_version > 0),
 reviewed_by TEXT NOT NULL,
 review_reference TEXT NOT NULL,
 reviewed_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY(category_id,schema_version)
);
CREATE TABLE IF NOT EXISTS evidence_category_field (
 category_id TEXT NOT NULL,
 schema_version INTEGER NOT NULL,
 field_key TEXT NOT NULL,
 value_type TEXT NOT NULL CHECK (value_type IN ('number','boolean','enum')),
 unit TEXT,
 allowed_values TEXT[] NOT NULL DEFAULT '{}',
 accepted_origins TEXT[] NOT NULL,
 required_context_keys TEXT[] NOT NULL,
 requires_protocol BOOLEAN NOT NULL,
 PRIMARY KEY(category_id,schema_version,field_key),
 FOREIGN KEY (category_id,schema_version) REFERENCES evidence_category_schema(category_id,schema_version),
 CHECK ((value_type='number' AND unit IS NOT NULL AND cardinality(allowed_values)=0) OR
        (value_type='boolean' AND unit IS NULL AND cardinality(allowed_values)=0) OR
        (value_type='enum' AND unit IS NULL AND cardinality(allowed_values)>=2)),
 CHECK (cardinality(accepted_origins)>0 AND cardinality(required_context_keys)>0)
);
CREATE TABLE IF NOT EXISTS structured_evidence_observation (
 id TEXT PRIMARY KEY,
 category_id TEXT NOT NULL,
 schema_version INTEGER NOT NULL,
 field_key TEXT NOT NULL,
 variant_id TEXT NOT NULL REFERENCES product_variant(id),
 source_id TEXT NOT NULL REFERENCES source_publisher(id),
 rights_grant_id TEXT NOT NULL REFERENCES rights_grant(id),
 source_url TEXT NOT NULL CHECK (source_url LIKE 'https://%'),
 source_document_sha256 CHAR(64) NOT NULL,
 original_test_id TEXT,
 origin TEXT NOT NULL CHECK(origin IN ('independent_lab_measurement','independent_professional_assessment','manufacturer_technical_specification')),
 value_json JSONB NOT NULL,
 context_json JSONB NOT NULL,
 protocol_id TEXT,
 protocol_version TEXT,
 value_text_sha256 CHAR(64) NOT NULL,
 anchor_sha256 CHAR(64) NOT NULL,
 candidate_fingerprint_sha256 CHAR(64) NOT NULL,
 observed_at TIMESTAMPTZ NOT NULL,
 review_status TEXT NOT NULL DEFAULT 'quarantined_unreviewed' CHECK(review_status IN ('quarantined_unreviewed','rejected','human_reviewed_internal')),
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 supersedes_observation_id TEXT REFERENCES structured_evidence_observation(id),
 FOREIGN KEY(category_id,schema_version,field_key) REFERENCES evidence_category_field(category_id,schema_version,field_key),
 CHECK (jsonb_typeof(value_json)='object' AND jsonb_typeof(context_json)='object'),
 CHECK (origin<>'independent_lab_measurement' OR (original_test_id IS NOT NULL AND protocol_id IS NOT NULL AND protocol_version IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS structured_observation_category_variant_field ON structured_evidence_observation(category_id,variant_id,field_key,observed_at DESC);
CREATE INDEX IF NOT EXISTS structured_observation_original_test ON structured_evidence_observation(original_test_id) WHERE original_test_id IS NOT NULL;
-- AI interpretation is segregated from source-observed facts and never auto-approved.
CREATE TABLE IF NOT EXISTS derived_evidence_hypothesis (
 id TEXT PRIMARY KEY,
 category_id TEXT NOT NULL,
 schema_version INTEGER NOT NULL,
 variant_id TEXT NOT NULL REFERENCES product_variant(id),
 hypothesis_key TEXT NOT NULL,
 result TEXT NOT NULL CHECK (result IN ('supported_candidate','contested_candidate','insufficient_evidence')),
 generated_at TIMESTAMPTZ NOT NULL,
 model_identifier TEXT NOT NULL,
 human_review_status TEXT NOT NULL DEFAULT 'pending' CHECK(human_review_status IN ('pending','rejected','reviewed_for_research')),
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 FOREIGN KEY(category_id,schema_version) REFERENCES evidence_category_schema(category_id,schema_version)
);
CREATE TABLE IF NOT EXISTS derived_hypothesis_input (
 hypothesis_id TEXT NOT NULL REFERENCES derived_evidence_hypothesis(id),
 observation_id TEXT NOT NULL REFERENCES structured_evidence_observation(id),
 PRIMARY KEY(hypothesis_id,observation_id)
);
-- The existing scoring_eligible_measurements view remains unchanged.
-- No view or bridge exposes these new tables to ranking.
COMMIT;
