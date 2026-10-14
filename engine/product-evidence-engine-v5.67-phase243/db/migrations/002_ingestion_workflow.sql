-- v0.3: append-only intake history, review gates and live rights revocation.
-- Apply AFTER 001_initial.sql, once, to a dedicated development database.
BEGIN;
ALTER TABLE import_batch DROP CONSTRAINT IF EXISTS import_batch_status_check;
ALTER TABLE import_batch ADD CONSTRAINT import_batch_status_check
 CHECK(status IN ('quarantined','reviewed','rejected','approved'));
ALTER TABLE import_batch ADD CONSTRAINT import_batch_hash_unique UNIQUE(source_file_sha256);
CREATE TABLE IF NOT EXISTS import_payload (
 batch_id TEXT PRIMARY KEY REFERENCES import_batch(id) ON DELETE RESTRICT,
 payload JSONB NOT NULL,
 imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS imported_record (
 batch_id TEXT NOT NULL REFERENCES import_batch(id),
 entity_type TEXT NOT NULL CHECK(entity_type IN
 ('family','variant','publisher','session','measurement','applicability','rights','article')),
 entity_id TEXT NOT NULL,
 PRIMARY KEY(entity_type,entity_id),
 UNIQUE(batch_id,entity_type,entity_id)
);
CREATE TABLE IF NOT EXISTS review_decision (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 batch_id TEXT NOT NULL REFERENCES import_batch(id),
 entity_type TEXT NOT NULL,
 entity_id TEXT NOT NULL,
 decision TEXT NOT NULL CHECK(decision IN ('approved','rejected')),
 actor TEXT NOT NULL CHECK(length(trim(actor))>0),
 rationale TEXT NOT NULL CHECK(length(trim(rationale))>0),
 documentary_uri TEXT,
 decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY (batch_id,entity_type,entity_id)
 REFERENCES imported_record(batch_id,entity_type,entity_id)
);
-- All admitted real measurements require: reviewed and approved batch, individually
-- approved measurement, applicable tested variant, and live non-revoked rights.
-- A synthetic fixture can never enter this production view.
CREATE OR REPLACE VIEW scoring_eligible_measurements AS
 SELECT DISTINCT m.id, m.session_id, m.dimension, m.metric, m.numeric_value,
 m.unit, m.direction, a.variant_id, t.protocol_id, t.protocol_version, t.conditions
 FROM measurement m
 JOIN test_session t ON t.id=m.session_id
 JOIN product_variant v ON v.id=t.tested_variant_id AND v.identity_status='verified'
 JOIN evidence_applicability a ON a.measurement_id=m.id AND a.decision='verified'
 JOIN measurement_rights mr ON mr.measurement_id=m.id
 JOIN rights_grant rg ON rg.id=mr.grant_id AND rg.publisher_id=t.publisher_id
 JOIN imported_record im ON im.entity_type='measurement' AND im.entity_id=m.id
 JOIN import_batch b ON b.id=im.batch_id AND b.status='approved' AND b.fixture_kind='real'
 WHERE m.status='admitted' AND m.numeric_value IS NOT NULL
   AND t.identity_status='verified'
   AND rg.status='authorized' AND 'commercial_scoring'=ANY(rg.allowed_uses)
   AND (rg.effective_from IS NULL OR rg.effective_from<=CURRENT_DATE)
   AND (rg.expires_on IS NULL OR rg.expires_on>=CURRENT_DATE)
   AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id
     AND d.entity_type='measurement' AND d.entity_id=m.id AND d.decision='approved'
     AND NOT EXISTS (SELECT 1 FROM review_decision newer WHERE newer.batch_id=d.batch_id
       AND newer.entity_type=d.entity_type AND newer.entity_id=d.entity_id AND newer.id>d.id))
   AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id
     AND d.entity_type='rights' AND d.entity_id=rg.id AND d.decision='approved'
     AND NOT EXISTS (SELECT 1 FROM review_decision newer WHERE newer.batch_id=d.batch_id
       AND newer.entity_type=d.entity_type AND newer.entity_id=d.entity_id AND newer.id>d.id))
   AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id
     AND d.entity_type='applicability' AND d.entity_id=a.id AND d.decision='approved'
     AND NOT EXISTS (SELECT 1 FROM review_decision newer WHERE newer.batch_id=d.batch_id
       AND newer.entity_type=d.entity_type AND newer.entity_id=d.entity_id AND newer.id>d.id));
-- The service DB user must have SELECT on the view ONLY, not underlying tables.
-- Deploy-time GRANT/REVOKE must be done by an administrator for actual roles.
COMMIT;
