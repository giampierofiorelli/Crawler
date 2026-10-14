-- Phase 80 additive, NOT deployed. Discovery stubs are intentionally cheap.
-- Original editorial articles are NOT stored. Source rights checks happen upstream.
CREATE TABLE IF NOT EXISTS product_discovery_stub (
 product_id TEXT NOT NULL,
 category_id TEXT NOT NULL,
 market TEXT NOT NULL,
 family_id TEXT NOT NULL,
 stage TEXT NOT NULL CHECK(stage IN ('discovery_stub','structured_record','independently_appraised')),
 identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
 market_presence_verified BOOLEAN NOT NULL DEFAULT FALSE,
 candidate_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
 last_discovered_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY(product_id, market)
);
CREATE INDEX IF NOT EXISTS idx_product_stub_category_market
 ON product_discovery_stub(category_id, market, stage);
CREATE TABLE IF NOT EXISTS discovery_editorial_lead (
 product_id TEXT NOT NULL,
 market TEXT NOT NULL,
 publisher_id TEXT NOT NULL,
 original_list_id TEXT NOT NULL,
 lead_type TEXT NOT NULL,
 placement TEXT NOT NULL,
 independence_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
 source_url TEXT NOT NULL,
 last_verified_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY(product_id, market, publisher_id, original_list_id)
);
CREATE TABLE IF NOT EXISTS product_market_lifecycle (
 product_id TEXT NOT NULL,
 market TEXT NOT NULL,
 lifecycle_state TEXT NOT NULL CHECK(lifecycle_state IN ('current','discontinued','uncertain')),
 retail_availability TEXT NOT NULL CHECK(retail_availability IN ('found_in_stock','not_confirmed')),
 archive_page_required BOOLEAN NOT NULL DEFAULT TRUE,
 verified_source_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
 reviewed_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY(product_id, market)
);
CREATE TABLE IF NOT EXISTS population_wave_audit (
 wave_id TEXT PRIMARY KEY,
 category_id TEXT NOT NULL,
 market TEXT NOT NULL,
 input_scope_digest TEXT NOT NULL,
 candidate_count INTEGER NOT NULL CHECK(candidate_count>=0),
 selected_for_enrichment JSONB NOT NULL,
 deferred_candidates JSONB NOT NULL,
 reason_codes JSONB NOT NULL,
 wave_state TEXT NOT NULL,
 market_coverage_certified BOOLEAN NOT NULL DEFAULT FALSE CHECK(market_coverage_certified=FALSE),
 decision_quality_certified BOOLEAN NOT NULL DEFAULT FALSE CHECK(decision_quality_certified=FALSE),
 decided_at TIMESTAMPTZ NOT NULL
);
