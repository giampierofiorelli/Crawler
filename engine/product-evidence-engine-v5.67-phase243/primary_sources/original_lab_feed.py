"""Research-only acceptance of ORIGINAL independent lab's measurement feed.

No network access, scraping, rights verification or ranking publication is performed.
An export must be acquired under a separately validated agreement. This module
checks data structure, attribution, variants, scope, method comparability and
creates quarantined research records; human attestations are not proof of rights.
"""
from __future__ import annotations

import argparse
import hashlib
import ipaddress
import json
import math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

MAX_BYTES = 5 * 1024 * 1024
MAX_ROWS = 10000
FIELDS = {'record_id','original_test_id','test_url','tested_variant','criterion',
          'measurement','unit','protocol_id','protocol_version','conditions','tested_at'}
DIMENSIONS = {'battery_runtime','noise_level','display_brightness','colour_error',
              'cleaning_effectiveness','render_throughput','thermal_temperature'}

class FeedQuarantine(ValueError):
    """Input cannot be used as independent primary lab evidence."""


def _date(s):
    if not isinstance(s,str) or not s.endswith(('Z','+00:00')):
        raise FeedQuarantine('invalid_timestamp')
    try:
        dt=datetime.fromisoformat(s.replace('Z','+00:00'))
        if dt.tzinfo is None:
            raise ValueError('timezone absent')
        return dt
    except ValueError as e:
        raise FeedQuarantine('invalid_timestamp') from e


def _https_url(value, host):
    try:
        p=urlsplit(value)
        name=p.hostname or ''
    except (ValueError, TypeError, AttributeError) as e:
        raise FeedQuarantine('invalid_publisher_url') from e
    try:
        ipaddress.ip_address(name)
    except ValueError:
        pass
    else:
        raise FeedQuarantine('ip_address_url_not_permitted')
    try:
        p=urlsplit(value)
        if (p.scheme != 'https' or p.hostname != host or p.username or p.password
                or p.port or (p.path and not p.path.startswith('/')) or p.fragment):
            raise FeedQuarantine('publisher_url_not_in_approved_scope')
    except FeedQuarantine:
        raise
    except ValueError as e:
        raise FeedQuarantine('invalid_publisher_url') from e


def validate_feed(raw: bytes, manifest: dict, expected_variant_ids: set[str]) -> dict:
    if not raw or len(raw)>MAX_BYTES:
        raise FeedQuarantine('empty_or_oversize_export')
    if not isinstance(manifest,dict) or manifest.get('kind')!='original_independent_lab_export':
        raise FeedQuarantine('original_lab_manifest_required')
    if manifest.get('review_only') is not True:
        raise FeedQuarantine('research_quarantine_must_be_enabled')
    domain=manifest.get('publisher_domain')
    if not isinstance(domain,str) or not domain or '/' in domain or domain.lower()!=domain:
        raise FeedQuarantine('invalid_publisher_domain')
    for field in ('publisher_name','rights_document_reference','rights_reviewer_id',
                  'methodology_document_reference','feed_contract_version','acquisition_reference'):
        if not isinstance(manifest.get(field),str) or not manifest[field].strip():
            raise FeedQuarantine(f'missing_{field}')
    rights=manifest.get('rights_asserted')
    if rights != {'commercial_storage': True, 'derivative_analysis': True, 'machine_ingestion': True}:
        raise FeedQuarantine('required_rights_not_attested')
    _https_url(manifest.get('publisher_url'), domain)
    captured=_date(manifest.get('captured_at'))
    if captured>datetime.now(timezone.utc):
        raise FeedQuarantine('future_capture')
    if not isinstance(expected_variant_ids,set) or not expected_variant_ids or not all(isinstance(x,str) and x for x in expected_variant_ids):
        raise FeedQuarantine('externally_verified_variant_catalogue_required')
    try:
        document=json.loads(raw.decode('utf-8-sig'))
    except (UnicodeDecodeError,json.JSONDecodeError) as e:
        raise FeedQuarantine('invalid_feed_json') from e
    if not isinstance(document,dict) or set(document)!= {'feed_version','publisher_domain','measurements'} or document['feed_version']!='1' or document['publisher_domain']!=domain:
        raise FeedQuarantine('unexpected_feed_schema_or_publisher')
    rows=document['measurements']
    if not isinstance(rows,list) or not (1<=len(rows)<=MAX_ROWS):
        raise FeedQuarantine('invalid_measurement_count')
    seen=set()
    tests={}
    records=[]
    for row in rows:
        if not isinstance(row,dict) or set(row)!=FIELDS:
            raise FeedQuarantine('unexpected_measurement_fields')
        for field in ('record_id','original_test_id','tested_variant','criterion','unit','protocol_id','protocol_version','test_url'):
            if not isinstance(row[field],str) or not row[field].strip():
                raise FeedQuarantine('missing_measurement_identity')
        if row['record_id'] in seen:
            raise FeedQuarantine('duplicate_measurement_record')
        seen.add(row['record_id'])
        if row['tested_variant'] not in expected_variant_ids:
            raise FeedQuarantine('unverified_exact_variant')
        if row['criterion'] not in DIMENSIONS:
            raise FeedQuarantine('unregistered_test_dimension')
        if (not isinstance(row['measurement'],(int,float)) or isinstance(row['measurement'],bool)
                or not math.isfinite(row['measurement']) or row['measurement'] < 0):
            raise FeedQuarantine('invalid_measured_value')
        if not isinstance(row['conditions'],dict) or not row['conditions'] or not all(isinstance(k,str) and isinstance(v,str) and k and v for k,v in row['conditions'].items()):
            raise FeedQuarantine('missing_test_conditions')
        _https_url(row['test_url'], domain)
        testtime=_date(row['tested_at'])
        if testtime>captured:
            raise FeedQuarantine('test_after_export_capture')
        # Every exported original test must consistently identify a single variant and provenance.
        testkey=row['original_test_id']
        identity=(row['tested_variant'],row['test_url'],row['tested_at'])
        if testkey in tests and tests[testkey]!=identity:
            raise FeedQuarantine('original_test_identity_conflict')
        tests[testkey]=identity
        # Prevent two different records being counted as separate measurements of one criterion/test.
        unique=(testkey,row['criterion'],row['protocol_id'],row['protocol_version'],
                json.dumps(row['conditions'],sort_keys=True))
        if unique in (r['_dedupe'] for r in records):
            raise FeedQuarantine('duplicate_test_criterion')
        records.append({'_dedupe':unique,**row})
    for row in records:
        del row['_dedupe']
    dimensions=Counter(row['criterion'] for row in records)
    coverage=defaultdict(set)
    for row in records:
        coverage[row['tested_variant']].add(row['criterion'])
    # Only comparable test dimensions across two or more distinct exact variants;
    # this is a coverage diagnostic, not a score or product ordering.
    comparable=defaultdict(set)
    for row in records:
        key=(row['criterion'],row['unit'],row['protocol_id'],row['protocol_version'],
             json.dumps(row['conditions'],sort_keys=True))
        comparable[key].add(row['tested_variant'])
    groups=[{'criterion':key[0],'unit':key[1],'protocol_id':key[2],
             'protocol_version':key[3],'conditions':json.loads(key[4]),
             'variant_count':len(variants),'variant_ids':sorted(variants)}
            for key,variants in sorted(comparable.items()) if len(variants)>=2]
    return {
        'potentially_comparable_groups':groups,
        'comparison_scope':'within same publisher, unit, protocol version and conditions only; comparability still needs method review',
        'source_kind':'original_independent_lab_measurements',
        'rights_status':'human_attested_not_cryptographically_verified',
        'review_only': True,
        'ranking_input_approved': False,
        'publishable_consumer_recommendations':False,
        'publisher':manifest['publisher_name'],
        'publisher_domain':domain,
        'rights_document_reference':manifest['rights_document_reference'],
        'rights_reviewer_id':manifest['rights_reviewer_id'],
        'methodology_document_reference':manifest['methodology_document_reference'],
        'acquisition_reference':manifest['acquisition_reference'],
        'input_sha256':hashlib.sha256(raw).hexdigest(),
        'captured_at':manifest['captured_at'],
        'record_count':len(records),
        'original_test_count':len(tests),
        'variant_count':len(coverage),
        'dimensions':dict(dimensions),
        'variant_criterion_coverage':{v:sorted(d) for v,d in sorted(coverage.items())},
        'measurements':records,
        'hard_limitations':[
            'Manifest assertions are NOT proof of a publisher licence or an approved API account.',
            'No transformation into 0-10 synthetic product quality scores is permitted.',
            'Different protocols, versions, units and test conditions are NOT automatically comparable.',
            'This adapter does not independently verify UK market exact variant identity.',
            'No data download or producer authentication is provided by this offline adapter.',
        ],
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument('export_json',type=Path)
    p.add_argument('manifest_json',type=Path)
    p.add_argument('approved_variants_json',type=Path)
    p.add_argument('report_json',type=Path)
    a=p.parse_args()
    variantdoc=json.loads(a.approved_variants_json.read_text())
    if not isinstance(variantdoc,list):
        raise FeedQuarantine('invalid_variant_list')
    report=validate_feed(a.export_json.read_bytes(),json.loads(a.manifest_json.read_text()),set(variantdoc))
    a.report_json.parent.mkdir(parents=True,exist_ok=True)
    a.report_json.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('RESEARCH ONLY: validated',report['record_count'],'original lab measurements; NO CONSUMER RANKING')

if __name__=='__main__':
    main()
