-- Phase 81 proposed migration; NOT executed against any production database.
-- Model manufacturing lifecycle must never infer retirement from merchant inventory.
ALTER TABLE product_market_lifecycle DROP COLUMN IF EXISTS retail_availability;

-- A confirmed retirement is a persistent model-level tombstone. Product page
-- remains available forever; these rows should be protected with restricted DB
-- privileges and separately audited official corrections (manual process).
CREATE TABLE IF NOT EXISTS confirmed_model_retirement (
 canonical_model_id TEXT PRIMARY KEY,
 confirmed_at TIMESTAMPTZ NOT NULL,
 primary_source_id TEXT NOT NULL,
 provenance_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
 archive_permanently BOOLEAN NOT NULL DEFAULT TRUE CHECK(archive_permanently),
 excluded_from_current_comparisons BOOLEAN NOT NULL DEFAULT TRUE CHECK(excluded_from_current_comparisons)
);
CREATE OR REPLACE FUNCTION reject_model_retirement_mutation() RETURNS TRIGGER AS $$
BEGIN
 RAISE EXCEPTION 'Confirmed model retirements are immutable; correction requires privileged audited migration';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS immutable_confirmed_model_retirement ON confirmed_model_retirement;
CREATE TRIGGER immutable_confirmed_model_retirement
 BEFORE UPDATE OR DELETE ON confirmed_model_retirement
 FOR EACH ROW EXECUTE FUNCTION reject_model_retirement_mutation();

-- Exact model identity and evidence lifecycle of newly announced products.
CREATE TABLE IF NOT EXISTS new_model_evidence_intake (
 canonical_model_id TEXT NOT NULL,
 category_id TEXT NOT NULL,
 intake_state TEXT NOT NULL CHECK(intake_state IN
  ('identity_unconfirmed','archived_discontinued','discovery_only','specifications_only',
   'independent_review_found','original_test_found')),
 source_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
 review_queued BOOLEAN NOT NULL DEFAULT FALSE,
 competition_authorized BOOLEAN NOT NULL DEFAULT FALSE CHECK(NOT competition_authorized),
 last_checked_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY (canonical_model_id,category_id)
);
-- For use by a future production ranking route. Current research-stage engine
-- does NOT claim to have run this view against a live database.
CREATE OR REPLACE VIEW current_discovery_models AS
SELECT s.* FROM product_discovery_stub s
WHERE NOT EXISTS (
 SELECT 1 FROM confirmed_model_retirement r
 WHERE r.canonical_model_id = s.product_id
);
