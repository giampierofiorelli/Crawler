-- Product Evidence Engine v0.2: PostgreSQL 15+; no extensions required.
-- All imports must pass application validation and human review before publication.
BEGIN;
CREATE TABLE IF NOT EXISTS product_family (
 id TEXT PRIMARY KEY, brand TEXT NOT NULL, model_name TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS product_variant (
 id TEXT PRIMARY KEY, family_id TEXT NOT NULL REFERENCES product_family(id),
 market TEXT NOT NULL CHECK (market IN ('UK','EU','US')),
 sku TEXT NOT NULL, gtin TEXT, currency TEXT NOT NULL,
 specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
 identity_status TEXT NOT NULL DEFAULT 'unverified' CHECK (identity_status IN ('unverified','verified')),
 UNIQUE(market,sku), UNIQUE(market,gtin)
);
CREATE TABLE IF NOT EXISTS source_publisher (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, website TEXT
);
CREATE TABLE IF NOT EXISTS review_article (
 id TEXT PRIMARY KEY, publisher_id TEXT NOT NULL REFERENCES source_publisher(id),
 url TEXT NOT NULL UNIQUE, title TEXT, published_on DATE,
 original_test_session_id TEXT, -- FK added below after test_session creation
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS test_session (
 id TEXT PRIMARY KEY, publisher_id TEXT NOT NULL REFERENCES source_publisher(id),
 tested_variant_id TEXT REFERENCES product_variant(id),
 tested_model_as_reported TEXT NOT NULL,
 identity_status TEXT NOT NULL CHECK (identity_status IN ('verified','ambiguous','unknown')),
 tested_on DATE, protocol_id TEXT NOT NULL, protocol_version TEXT,
 conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
 CHECK (identity_status <> 'verified' OR tested_variant_id IS NOT NULL)
);
ALTER TABLE review_article ADD CONSTRAINT review_article_session_fk
 FOREIGN KEY (original_test_session_id) REFERENCES test_session(id);
CREATE TABLE IF NOT EXISTS measurement (
 id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES test_session(id),
 dimension TEXT NOT NULL, metric TEXT NOT NULL, numeric_value NUMERIC,
 unit TEXT, qualitative_value TEXT, direction TEXT CHECK (direction IN ('higher','lower','descriptive')),
 method_notes TEXT, status TEXT NOT NULL DEFAULT 'pending'
 CHECK (status IN ('pending','admitted','limited','contextual','excluded')),
 CHECK ((numeric_value IS NOT NULL) <> (qualitative_value IS NOT NULL)),
 CHECK (numeric_value IS NULL OR unit IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS evidence_applicability (
 id TEXT PRIMARY KEY, measurement_id TEXT NOT NULL REFERENCES measurement(id),
 variant_id TEXT NOT NULL REFERENCES product_variant(id),
 decision TEXT NOT NULL CHECK (decision IN ('verified','rejected','pending')),
 rationale TEXT NOT NULL, reviewer TEXT, reviewed_at TIMESTAMPTZ,
 CHECK (decision <> 'verified' OR (reviewer IS NOT NULL AND reviewed_at IS NOT NULL)),
 UNIQUE(measurement_id,variant_id)
);
CREATE TABLE IF NOT EXISTS rights_grant (
 id TEXT PRIMARY KEY, publisher_id TEXT NOT NULL REFERENCES source_publisher(id),
 status TEXT NOT NULL CHECK (status IN ('authorized','unknown','prohibited','expired')),
 allowed_uses TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 evidence_uri TEXT, effective_from DATE, expires_on DATE,
 recorded_by TEXT NOT NULL, recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (status <> 'authorized' OR evidence_uri IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS measurement_rights (
 measurement_id TEXT NOT NULL REFERENCES measurement(id),
 grant_id TEXT NOT NULL REFERENCES rights_grant(id),
 PRIMARY KEY(measurement_id,grant_id)
);
CREATE TABLE IF NOT EXISTS market_offer (
 id TEXT PRIMARY KEY, variant_id TEXT NOT NULL REFERENCES product_variant(id),
 merchant TEXT NOT NULL, market TEXT NOT NULL CHECK (market IN ('UK','EU','US')),
 currency TEXT NOT NULL, price NUMERIC(12,2) NOT NULL CHECK(price>=0),
 availability TEXT NOT NULL CHECK(availability IN ('in_stock','out_of_stock','unknown')),
 source_url TEXT NOT NULL, observed_at TIMESTAMPTZ NOT NULL,
 CHECK (source_url LIKE 'https://%')
);
CREATE TABLE IF NOT EXISTS import_batch (
 id TEXT PRIMARY KEY, dataset_label TEXT NOT NULL, source_file_sha256 TEXT NOT NULL,
 fixture_kind TEXT NOT NULL CHECK (fixture_kind IN ('synthetic','real')),
 status TEXT NOT NULL DEFAULT 'quarantined' CHECK(status IN ('quarantined','reviewed','rejected')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_event (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 batch_id TEXT REFERENCES import_batch(id), actor TEXT NOT NULL,
 action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
 details JSONB NOT NULL DEFAULT '{}'::jsonb,
 occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS recommendation_run (
 id TEXT PRIMARY KEY, algorithm_version TEXT NOT NULL, market TEXT NOT NULL,
 request JSONB NOT NULL, result JSONB NOT NULL, evidence_ids TEXT[] NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Safety: only expose this view to recommendation-service database role.
-- It requires a documented rights grant for 'commercial_scoring', exact verified applicability,
-- and a verified tested unit. Additional method compatibility checks remain in the engine.
CREATE OR REPLACE VIEW scoring_eligible_measurements AS
 SELECT m.id, m.session_id, m.dimension, m.metric, m.numeric_value, m.unit,
        m.direction, a.variant_id, t.protocol_id, t.protocol_version, t.conditions
 FROM measurement m
 JOIN test_session t ON t.id=m.session_id
 JOIN evidence_applicability a ON a.measurement_id=m.id AND a.decision='verified'
 JOIN measurement_rights mr ON mr.measurement_id=m.id
 JOIN rights_grant rg ON rg.id=mr.grant_id AND rg.publisher_id=t.publisher_id
 WHERE m.status='admitted' AND m.numeric_value IS NOT NULL
   AND t.identity_status='verified'
   AND rg.status='authorized' AND 'commercial_scoring'=ANY(rg.allowed_uses)
   AND (rg.effective_from IS NULL OR rg.effective_from<=CURRENT_DATE)
   AND (rg.expires_on IS NULL OR rg.expires_on>=CURRENT_DATE);
COMMIT;
