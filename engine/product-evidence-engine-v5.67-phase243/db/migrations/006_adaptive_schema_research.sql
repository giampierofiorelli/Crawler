-- Phase 71: ADDITIVE research-only adaptive schema / knowledge graph.
-- UNEXECUTED, written for PostgreSQL 15+. Apply AFTER migration 005.
-- Research proposals never automatically alter evidence_category_field or scoring views.
-- No original article text, excerpts, AI free-form prose, or embeddings.
BEGIN;
CREATE TABLE IF NOT EXISTS adaptive_schema_proposal (
 id TEXT PRIMARY KEY,
 category_id TEXT NOT NULL,
 parent_schema_version INTEGER NOT NULL,
 dimension_kind TEXT NOT NULL CHECK(dimension_kind IN ('field','relationship')),
 definition_key TEXT NOT NULL CHECK(definition_key ~ '^[a-z][a-z0-9_]*$'),
 definition_sha256 CHAR(64) NOT NULL CHECK(definition_sha256 ~ '^[0-9a-f]{64}$'),
 definition_json JSONB NOT NULL CHECK(jsonb_typeof(definition_json)='object' AND NOT (definition_json ?| ARRAY['body','text','excerpt','raw_page','embedding','prompt'])),
 status TEXT NOT NULL CHECK(status IN ('needs_more_evidence','auto_research_candidate','semantic_conflict','rejected')),
 discovered_at TIMESTAMPTZ NOT NULL,
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 FOREIGN KEY(category_id,parent_schema_version) REFERENCES evidence_category_schema(category_id,schema_version),
 UNIQUE(category_id,parent_schema_version,dimension_kind,definition_key,definition_sha256)
);
CREATE TABLE IF NOT EXISTS adaptive_schema_signal (
 id TEXT PRIMARY KEY,
 proposal_id TEXT NOT NULL REFERENCES adaptive_schema_proposal(id),
 variant_id TEXT NOT NULL REFERENCES product_variant(id),
 source_id TEXT NOT NULL REFERENCES source_publisher(id),
 original_test_id TEXT NOT NULL,
 original_test_lineage_reference TEXT NOT NULL,
 source_url TEXT NOT NULL CHECK(source_url LIKE 'https://%'),
 source_sha256 CHAR(64) NOT NULL CHECK(source_sha256 ~ '^[0-9a-f]{64}$'),
 anchor_sha256 CHAR(64) NOT NULL CHECK(anchor_sha256 ~ '^[0-9a-f]{64}$'),
 value_text_sha256 CHAR(64) NOT NULL CHECK(value_text_sha256 ~ '^[0-9a-f]{64}$'),
 rights_grant_id TEXT NOT NULL REFERENCES rights_grant(id),
 discovered_at TIMESTAMPTZ NOT NULL,
 status TEXT NOT NULL DEFAULT 'quarantined_unverified' CHECK(status IN ('quarantined_unverified','rejected')),
 UNIQUE(proposal_id,variant_id,source_id,original_test_id,anchor_sha256)
);
-- A human-vetted promotion remains a distinct, audited event. Never copy a candidate to active definitions by trigger.
CREATE TABLE IF NOT EXISTS adaptive_schema_promotion_review (
 id TEXT PRIMARY KEY,
 proposal_id TEXT NOT NULL REFERENCES adaptive_schema_proposal(id),
 destination_version INTEGER NOT NULL CHECK(destination_version > 0),
 reviewer TEXT NOT NULL,
 review_reference TEXT NOT NULL,
 reviewed_at TIMESTAMPTZ NOT NULL,
 outcome TEXT NOT NULL CHECK(outcome IN ('approved','rejected')),
 UNIQUE(proposal_id,destination_version)
);
-- Relationship records are different from field observations, and never auto-score a product.
CREATE TABLE IF NOT EXISTS structured_evidence_relation (
 id TEXT PRIMARY KEY,
 category_id TEXT NOT NULL,
 schema_version INTEGER NOT NULL,
 relation_key TEXT NOT NULL CHECK(relation_key ~ '^[a-z][a-z0-9_]*$'),
 relation_kind TEXT NOT NULL CHECK(relation_kind IN ('compatible_with','incompatible_with','requires','tested_with','has_accessory')),
 subject_variant_id TEXT NOT NULL REFERENCES product_variant(id),
 object_kind TEXT NOT NULL CHECK(object_kind IN ('product_variant','accessory','environment')),
 object_id TEXT NOT NULL,
 context_json JSONB NOT NULL CHECK(jsonb_typeof(context_json)='object'),
 origin TEXT NOT NULL CHECK(origin IN ('independent_lab_measurement','independent_professional_assessment','manufacturer_technical_specification')),
 proposal_id TEXT NOT NULL REFERENCES adaptive_schema_proposal(id),
 source_id TEXT NOT NULL REFERENCES source_publisher(id),
 rights_grant_id TEXT NOT NULL REFERENCES rights_grant(id),
 source_url TEXT NOT NULL CHECK(source_url LIKE 'https://%'),
 original_test_id TEXT NOT NULL,
 source_sha256 CHAR(64) NOT NULL CHECK(source_sha256 ~ '^[0-9a-f]{64}$'),
 value_text_sha256 CHAR(64) NOT NULL CHECK(value_text_sha256 ~ '^[0-9a-f]{64}$'),
 anchor_sha256 CHAR(64) NOT NULL CHECK(anchor_sha256 ~ '^[0-9a-f]{64}$'),
 observed_at TIMESTAMPTZ NOT NULL,
 review_status TEXT NOT NULL DEFAULT 'quarantined_unverified'
    CHECK(review_status IN ('quarantined_unverified','rejected','human_reviewed_internal')),
 publication_ready BOOLEAN NOT NULL DEFAULT FALSE CHECK(publication_ready=FALSE),
 ranking_eligible BOOLEAN NOT NULL DEFAULT FALSE CHECK(ranking_eligible=FALSE),
 FOREIGN KEY(category_id,schema_version) REFERENCES evidence_category_schema(category_id,schema_version)
);
CREATE INDEX IF NOT EXISTS ix_adaptive_schema_support_source ON adaptive_schema_signal(source_id,original_test_id);
CREATE INDEX IF NOT EXISTS ix_evidence_relation_query ON structured_evidence_relation(category_id,subject_variant_id,relation_key);
-- Do not expose any adaptive schema research tables in launch or scoring views.
COMMIT;
