-- Phase 34: authorized, immutable merchant price observations; PostgreSQL 15+.
-- Apply after migrations 001-003. NOT YET TESTED ON LIVE POSTGRESQL.
-- Data is quarantined by default. No price observation is automatically published.
BEGIN;
CREATE TABLE IF NOT EXISTS price_feed_source (
 id TEXT PRIMARY KEY,
 merchant_id TEXT NOT NULL,
 market TEXT NOT NULL CHECK (market IN ('UK','EU','US')),
 currency TEXT NOT NULL,
 permission_status TEXT NOT NULL DEFAULT 'unknown'
   CHECK (permission_status IN ('authorized','unknown','prohibited','expired')),
 permission_evidence_uri TEXT,
 permitted_uses TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 expires_at TIMESTAMPTZ,
 reviewed_by TEXT,
 reviewed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (permission_status <> 'authorized' OR
   (permission_evidence_uri LIKE 'https://%' AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS price_observation (
 id TEXT PRIMARY KEY,
 feed_source_id TEXT NOT NULL REFERENCES price_feed_source(id),
 variant_id TEXT NOT NULL REFERENCES product_variant(id),
 merchant_id TEXT NOT NULL,
 market TEXT NOT NULL CHECK (market IN ('UK','EU','US')),
 currency TEXT NOT NULL,
 condition TEXT NOT NULL CHECK (condition IN ('new','refurbished','used')),
 item_price NUMERIC(12,2) NOT NULL CHECK (item_price>=0),
 shipping_price NUMERIC(12,2),
 taxes_included BOOLEAN NOT NULL DEFAULT FALSE,
 availability TEXT NOT NULL CHECK (availability IN ('in_stock','out_of_stock','unknown')),
 observed_at TIMESTAMPTZ NOT NULL,
 product_url TEXT NOT NULL CHECK (product_url LIKE 'https://%'),
 delivery_days NUMERIC(8,2) CHECK (delivery_days>=0),
 identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
 review_status TEXT NOT NULL DEFAULT 'quarantined'
   CHECK (review_status IN ('quarantined','approved','rejected')),
 reviewed_by TEXT,
 reviewed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (review_status <> 'approved' OR
   (identity_verified AND shipping_price IS NOT NULL AND taxes_included
    AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS price_observation_variant_time_idx
 ON price_observation (variant_id,market,currency,observed_at DESC);
CREATE INDEX IF NOT EXISTS price_observation_source_time_idx
 ON price_observation (feed_source_id,observed_at DESC);
-- Current state of rights must be checked at read time, including revocation/expiry.
CREATE OR REPLACE VIEW approved_price_observations WITH (security_barrier=true) AS
SELECT p.id,p.variant_id,p.merchant_id,p.market,p.currency,p.condition,
 p.item_price,p.shipping_price,p.taxes_included,p.availability,p.observed_at,
 p.product_url,p.delivery_days,p.feed_source_id
FROM price_observation p
JOIN price_feed_source s ON s.id=p.feed_source_id
JOIN product_variant v ON v.id=p.variant_id
WHERE p.review_status='approved' AND p.identity_verified
 AND v.identity_status='verified'
 AND p.merchant_id=s.merchant_id AND p.market=s.market AND p.currency=s.currency
 AND v.market=p.market AND v.currency=p.currency
 AND p.shipping_price IS NOT NULL AND p.taxes_included
 AND s.permission_status='authorized'
 AND s.permission_evidence_uri LIKE 'https://%'
 AND 'price_display'=ANY(s.permitted_uses)
 AND 'price_history'=ANY(s.permitted_uses)
 AND s.reviewed_by IS NOT NULL AND s.reviewed_at IS NOT NULL
 AND (s.expires_at IS NULL OR s.expires_at>now())
 AND p.observed_at<=now();
-- IMPORTANT: DB role permissions/RLS and source-revocation audit still require hardening.
COMMIT;
