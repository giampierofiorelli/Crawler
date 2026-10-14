"""Offline importer for an independently acquired Blender Open Data grouped CSV export.

It does NOT scrape/download sites, convert GPU names into retail SKUs, or calculate
consumer-product rankings. Blender's raw dataset is CC0, but this adapter accepts
only a source with an explicit human-reviewed scope record and matched version,
backend and grouped schema. No API access or public-site availability is assumed.

Example:
  python -m primary_sources.blender_ingest \
    fixtures/primary_blender/observations.csv \
    fixtures/primary_blender/manifest.json output/blender-research.json
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import io
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, parse_qs

ALLOWED_LICENSE_URL = 'https://opendata.blender.org/download/'
ALLOWED_COLUMNS = frozenset({'Device Name', 'Median Score', 'Number of Benchmarks'})
MAX_INPUT_BYTES = 10 * 1024 * 1024

class QuarantinedSource(ValueError):
    """Use of the input is not proven safe, compatible or structurally valid."""


def require_manifest(m: dict) -> dict:
    if not isinstance(m, dict):
        raise QuarantinedSource('manifest_must_be_object')
    if m.get('source_type') != 'original_benchmark' or m.get('publisher') != 'Blender Open Data':
        raise QuarantinedSource('unexpected_publisher')
    if m.get('license_url') != ALLOWED_LICENSE_URL or m.get('licence_basis') != 'CC0':
        raise QuarantinedSource('unverified_license_basis')
    if m.get('rights_reviewed') is not True or not str(m.get('reviewer_reference', '')).strip():
        raise QuarantinedSource('independent_rights_review_missing')
    if m.get('acquisition_method') not in {'official_site_csv_export', 'documented_public_page_transcription'}:
        raise QuarantinedSource('acquisition_method_not_attested')
    if m.get('group_by') != 'device_name':
        raise QuarantinedSource('grouping_not_device_name')
    if not isinstance(m.get('blender_version'), str) or not m['blender_version'].strip():
        raise QuarantinedSource('missing_benchmark_version')
    if not isinstance(m.get('compute_type'), str) or not m['compute_type'].strip():
        raise QuarantinedSource('missing_compute_backend')
    url = m.get('source_url', '')
    try:
        parsed = urlsplit(url)
        qs = parse_qs(parsed.query)
    except (TypeError, ValueError):
        raise QuarantinedSource('invalid_source_url')
    if (parsed.scheme != 'https' or parsed.hostname != 'opendata.blender.org' or
        parsed.username or parsed.password or parsed.port or
        parsed.path != '/benchmarks/query/' or
        qs.get('group_by') != ['device_name'] or
        qs.get('blender_version') != [m['blender_version']] or
        qs.get('compute_type') != [m['compute_type']]):
        raise QuarantinedSource('source_scope_does_not_match_manifest')
    captured_at = m.get('captured_at')
    try:
        parsed_date = datetime.fromisoformat(captured_at.replace('Z', '+00:00'))
        if parsed_date.tzinfo is None or parsed_date > datetime.now(timezone.utc):
            raise ValueError()
    except (ValueError, AttributeError):
        raise QuarantinedSource('invalid_capture_timestamp')
    return m


def parse_csv(blob: bytes, manifest: dict) -> dict:
    m = require_manifest(manifest)
    if not blob or len(blob) > MAX_INPUT_BYTES:
        raise QuarantinedSource('empty_or_oversized_csv')
    try:
        text = blob.decode('utf-8-sig', errors='strict')
    except UnicodeDecodeError:
        raise QuarantinedSource('invalid_utf8')
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None or set(reader.fieldnames) != ALLOWED_COLUMNS:
        raise QuarantinedSource('unexpected_csv_columns')
    out = []
    seen = set()
    for row in reader:
        if None in row or any(value is None for value in row.values()):
            raise QuarantinedSource('malformed_csv_row')
        name = row['Device Name'].strip()
        if not name or len(name) > 180 or any(ord(x)<32 for x in name):
            raise QuarantinedSource('invalid_device_label')
        if name.casefold() in seen:
            raise QuarantinedSource('duplicate_device_name')
        seen.add(name.casefold())
        try:
            score = float(row['Median Score'])
            count_string = row['Number of Benchmarks'].strip()
            if not count_string.isdecimal():
                raise ValueError()
            count = int(count_string)
        except (ValueError, OverflowError):
            raise QuarantinedSource('invalid_score_or_sample_count')
        if not math.isfinite(score) or score <= 0 or count <= 0:
            raise QuarantinedSource('out_of_range_score_or_count')
        out.append({
            'device_label': name,
            'median_render_score': score,
            'num_benchmark_submissions': count,
            'quality_flags': ['community_submitted_not_lab_controlled', 'device_label_not_retail_sku'] +
               (['low_submission_count'] if count < 10 else []),
        })
    if not out:
        raise QuarantinedSource('empty_dataset')
    return {
        'publishable_consumer_recommendations': False,
        'ranking_input_approved': False,
        'research_use_only': True,
        'original_publisher': 'Blender Open Data',
        'metric': 'Blender rendering benchmark score',
        'metric_scope': 'one workload, version and compute backend only',
        'benchmark_version': m['blender_version'],
        'compute_backend': m['compute_type'],
        'licence_basis': m['licence_basis'],
        'license_url': m['license_url'],
        'source_url': m['source_url'],
        'captured_at': m['captured_at'],
        'acquisition_method': m['acquisition_method'],
        'reviewer_reference': m['reviewer_reference'],
        'input_sha256': hashlib.sha256(blob).hexdigest(),
        'limitations': [
            'Community-submitted benchmarks are not independent controlled product reviews.',
            'Grouped device names do not reliably identify an exact UK retail product variant.',
            'This metric cannot by itself establish which complete consumer product is best.',
            'The adapter does not authenticate a reviewer, a licence document or data origin.',
            'This is not a live API integration or verified bulk download.',
        ],
        'device_count': len(out),
        'devices': out,
    }


def main() -> None:
    p = argparse.ArgumentParser(description='Research-only Blender Open Data CSV adapter (offline)')
    p.add_argument('csv_file', type=Path)
    p.add_argument('manifest', type=Path)
    p.add_argument('output', type=Path)
    args = p.parse_args()
    report = parse_csv(args.csv_file.read_bytes(), json.loads(args.manifest.read_text(encoding='utf-8')))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    print(f'Research-only import validated: {report["device_count"]} grouped device labels; NOT suitable for product rankings')

if __name__ == '__main__':
    main()
