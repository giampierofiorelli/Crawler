"""Read-only, fail-closed PostgreSQL -> TypeScript engine snapshot bridge (v0.4).

Reads ONLY scoring_eligible_measurements for evidence, never raw measurements.
The service database role must have SELECT on the allowlisted tables/views only.
No file input can claim to be an approved production database export.
"""
from __future__ import annotations
import json
import os
from decimal import Decimal
from datetime import date, datetime
from typing import Any

# Query 1: only verified market variants with an in-stock offer observed recently.
# Market offer is not a product attribute; a fresh quote is required for price filtering.
VARIANTS_SQL = """
SELECT v.id, v.family_id, v.market, v.sku, v.currency, v.specifications,
       offer.price, offer.observed_at, offer.source_url AS offer_url
FROM product_variant v
JOIN LATERAL (
    SELECT o.price, o.observed_at, o.source_url
    FROM market_offer o
    WHERE o.variant_id=v.id AND o.market=v.market AND o.currency=v.currency
      AND o.availability='in_stock'
      AND o.observed_at >= CURRENT_TIMESTAMP - INTERVAL '48 hours'
      AND o.observed_at <= CURRENT_TIMESTAMP
    ORDER BY o.observed_at DESC, o.id DESC LIMIT 1
) offer ON TRUE
WHERE v.identity_status='verified'
ORDER BY v.id
"""

# Query 2: eligibility view gates approval, rights, identity, applicability and batch kind.
# The link is a citation to an original article, not permission to republish its text.
EVIDENCE_SQL = """
SELECT e.id, e.session_id, e.dimension, e.metric, e.numeric_value,
       e.unit, e.direction, e.variant_id, e.protocol_id, e.protocol_version,
       e.conditions, t.tested_variant_id, p.name AS source,
       article.url AS source_url
FROM scoring_eligible_measurements e
JOIN test_session t ON t.id=e.session_id
JOIN source_publisher p ON p.id=t.publisher_id
JOIN LATERAL (
    SELECT a.url FROM review_article a
    WHERE a.original_test_session_id=t.id AND a.publisher_id=t.publisher_id
    ORDER BY a.id LIMIT 1
) article ON TRUE
ORDER BY e.id, e.variant_id
"""

def jsonable(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [jsonable(v) for v in value]
    return value

def rows(cursor: Any, sql: str) -> list[dict[str, Any]]:
    cursor.execute(sql)
    names = [d.name if hasattr(d, 'name') else d[0] for d in cursor.description]
    return [jsonable(dict(zip(names, record))) for record in cursor.fetchall()]

def export_snapshot(conn: Any) -> dict[str, Any]:
    """Use one repeatable-read transaction for internally consistent rights snapshot."""
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY')
            variants = rows(cur, VARIANTS_SQL)
            evidence = rows(cur, EVIDENCE_SQL)
    return {'schema_version': 1, 'origin': 'live-postgres-eligible-view',
            'variants': variants, 'evidence': evidence}

def main() -> None:
    try:
        import psycopg
    except ImportError as exc:
        raise SystemExit('Install psycopg: pip install -r requirements-db.txt') from exc
    if not os.environ.get('DATABASE_URL'):
        raise SystemExit('DATABASE_URL is required')
    with psycopg.connect(os.environ['DATABASE_URL']) as conn:
        print(json.dumps(export_snapshot(conn), allow_nan=False))

if __name__ == '__main__':
    main()
