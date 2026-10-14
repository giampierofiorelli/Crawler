-- v0.4: additional defense-in-depth for the read-only scoring view.
-- Apply AFTER 002_ingestion_workflow.sql. Not tested against a live PostgreSQL instance.
-- No synthetic imports are ever eligible. Approval is required for the tested variant,
-- session, measurement, applicability and rights. All must belong to the same batch.
BEGIN;
CREATE OR REPLACE VIEW scoring_eligible_measurements WITH (security_barrier=true) AS
SELECT DISTINCT m.id, m.session_id, m.dimension, m.metric, m.numeric_value,
       m.unit, m.direction, a.variant_id, t.protocol_id, t.protocol_version, t.conditions
FROM measurement m
JOIN test_session t ON t.id=m.session_id AND t.identity_status='verified'
JOIN product_variant vt ON vt.id=t.tested_variant_id AND vt.identity_status='verified'
JOIN evidence_applicability a ON a.measurement_id=m.id AND a.decision='verified'
JOIN product_variant va ON va.id=a.variant_id AND va.identity_status='verified'
JOIN measurement_rights mr ON mr.measurement_id=m.id
JOIN rights_grant rg ON rg.id=mr.grant_id AND rg.publisher_id=t.publisher_id
JOIN imported_record im ON im.entity_type='measurement' AND im.entity_id=m.id
JOIN import_batch b ON b.id=im.batch_id AND b.status='approved' AND b.fixture_kind='real'
JOIN imported_record iv ON iv.batch_id=b.id AND iv.entity_type='variant' AND iv.entity_id=vt.id
JOIN imported_record its ON its.batch_id=b.id AND its.entity_type='session' AND its.entity_id=t.id
JOIN imported_record ia ON ia.batch_id=b.id AND ia.entity_type='applicability' AND ia.entity_id=a.id
JOIN imported_record ir ON ir.batch_id=b.id AND ir.entity_type='rights' AND ir.entity_id=rg.id
WHERE m.status='admitted' AND m.numeric_value IS NOT NULL
  -- Cross-variant transfer needs a separately implemented documented equivalence workflow.
  AND a.variant_id=t.tested_variant_id
  AND rg.status='authorized' AND rg.evidence_uri IS NOT NULL
  AND 'commercial_scoring'=ANY(rg.allowed_uses)
  AND (rg.effective_from IS NULL OR rg.effective_from<=CURRENT_DATE)
  AND (rg.expires_on IS NULL OR rg.expires_on>=CURRENT_DATE)
  AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id AND d.entity_type='variant' AND d.entity_id=vt.id
     AND d.decision='approved' AND NOT EXISTS (SELECT 1 FROM review_decision n WHERE n.batch_id=d.batch_id AND n.entity_type=d.entity_type AND n.entity_id=d.entity_id AND n.id>d.id))
  AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id AND d.entity_type='session' AND d.entity_id=t.id
     AND d.decision='approved' AND NOT EXISTS (SELECT 1 FROM review_decision n WHERE n.batch_id=d.batch_id AND n.entity_type=d.entity_type AND n.entity_id=d.entity_id AND n.id>d.id))
  AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id AND d.entity_type='measurement' AND d.entity_id=m.id
     AND d.decision='approved' AND NOT EXISTS (SELECT 1 FROM review_decision n WHERE n.batch_id=d.batch_id AND n.entity_type=d.entity_type AND n.entity_id=d.entity_id AND n.id>d.id))
  AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id AND d.entity_type='applicability' AND d.entity_id=a.id
     AND d.decision='approved' AND NOT EXISTS (SELECT 1 FROM review_decision n WHERE n.batch_id=d.batch_id AND n.entity_type=d.entity_type AND n.entity_id=d.entity_id AND n.id>d.id))
  AND EXISTS (SELECT 1 FROM review_decision d WHERE d.batch_id=b.id AND d.entity_type='rights' AND d.entity_id=rg.id
     AND d.decision='approved' AND d.documentary_uri IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM review_decision n WHERE n.batch_id=d.batch_id AND n.entity_type=d.entity_type AND n.entity_id=d.entity_id AND n.id>d.id));
COMMIT;
