"""Phase 55: repository-native intake of PRIMARY headphone measurements.

The source publishes its own raw frequency-response files under CC BY 4.0.
Uses GitHub's official Contents API, pinned to an immutable git commit.
Only this explicitly configured source is supported: no generic scraping.
Files stay in a research-only quarantine; there is NO product ranking.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import math
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

SOURCE_REPO = 'superbestaudiofriends/headphone-measurements-frequency-response'
SOURCE_URL = f'https://github.com/{SOURCE_REPO}'
SOURCE_LICENSE_URL = f'{SOURCE_URL}#use-of-these-datasets'
LICENSE_ID = 'CC-BY-4.0'
API_ROOT = f'https://api.github.com/repos/{SOURCE_REPO}'
SHA_RE = re.compile(r'^[a-f0-9]{40}$')
FILENAME_RE = re.compile(r'^(c(?:EAR|EARS|FPC)[A-Z0-9]+)-([A-Za-z0-9][A-Za-z0-9-]*)-([LR])\.txt$')
MAX_RESPONSE_BYTES = 1_200_000
MAX_DATA_BYTES = 200_000
MAX_POINTS = 10_000


class UpstreamEvidenceError(ValueError):
    pass


def _json_bytes(obj):
    return (json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False) + '\n').encode()


def _fetch_api(url: str, token: str | None = None) -> bytes:
    """Host- and redirect-restricted request; never transmit token elsewhere."""
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != 'https' or parsed.hostname != 'api.github.com' or parsed.username or parsed.password or parsed.port or parsed.fragment:
        raise UpstreamEvidenceError('external_api_host_forbidden')
    if not parsed.path.startswith(f'/repos/{SOURCE_REPO}/'):
        raise UpstreamEvidenceError('other_repository_forbidden')

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            raise UpstreamEvidenceError('redirect_not_permitted')

    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'ProductEvidenceEngine-Research/55', 'X-GitHub-Api-Version': '2022-11-28'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.build_opener(NoRedirect).open(req, timeout=15) as response:
            size = response.headers.get('Content-Length')
            if size and int(size) > MAX_RESPONSE_BYTES:
                raise UpstreamEvidenceError('oversize_api_response')
            raw = response.read(MAX_RESPONSE_BYTES + 1)
            if len(raw) > MAX_RESPONSE_BYTES:
                raise UpstreamEvidenceError('oversize_api_response')
            return raw
    except urllib.error.URLError as exc:
        raise UpstreamEvidenceError(f'api_request_unavailable: {type(exc.reason).__name__}') from exc


def _decode_json(raw: bytes):
    if len(raw) > MAX_RESPONSE_BYTES:
        raise UpstreamEvidenceError('oversize_api_response')
    try:
        return json.loads(raw.decode('utf-8'))
    except (ValueError, UnicodeDecodeError) as exc:
        raise UpstreamEvidenceError('invalid_github_json') from exc


def resolve_pinned_commit(get: Callable[[str], bytes], branch: str = 'master') -> str:
    if branch != 'master':
        raise UpstreamEvidenceError('branch_not_allowlisted')
    result = _decode_json(get(f'{API_ROOT}/commits/master'))
    sha = result.get('sha') if isinstance(result, dict) else None
    if not isinstance(sha, str) or not SHA_RE.fullmatch(sha):
        raise UpstreamEvidenceError('missing_immutable_commit')
    return sha


def decode_github_file(raw: bytes, file_name: str) -> tuple[bytes, str]:
    result = _decode_json(raw)
    if (not isinstance(result, dict) or result.get('type') != 'file'
            or result.get('path') != file_name or result.get('encoding') != 'base64'
            or not isinstance(result.get('content'), str)):
        raise UpstreamEvidenceError('unexpected_github_file_response')
    size = result.get('size')
    if type(size) is not int or not 0 < size <= MAX_DATA_BYTES:
        raise UpstreamEvidenceError('invalid_file_size')
    try:
        data = base64.b64decode(''.join(result['content'].split()), validate=True)
    except (ValueError, base64.binascii.Error) as exc:
        raise UpstreamEvidenceError('invalid_base64_content') from exc
    if len(data) != size:
        raise UpstreamEvidenceError('file_size_mismatch')
    # A Git blob SHA checks that the bytes match the immutable revision's API metadata.
    expected_blob_sha = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\x00' + data).hexdigest()
    if result.get('sha') != expected_blob_sha:
        raise UpstreamEvidenceError('git_blob_integrity_failure')
    return data, expected_blob_sha


def parse_frequency_curve(file_name: str, data: bytes) -> dict:
    match = FILENAME_RE.fullmatch(file_name)
    if match is None or '/' in file_name or '\\' in file_name:
        raise UpstreamEvidenceError('invalid_measurement_filename')
    if len(data) > MAX_DATA_BYTES:
        raise UpstreamEvidenceError('measurement_too_large')
    try:
        text = data.decode('utf-8-sig')
    except UnicodeDecodeError as exc:
        raise UpstreamEvidenceError('measurement_not_text') from exc
    points = []
    previous = 0.0
    for line in text.splitlines():
        if not line.strip():
            continue
        cols = line.split()
        if len(cols) != 2:
            raise UpstreamEvidenceError('invalid_measurement_row')
        try:
            frequency, amplitude = map(float, cols)
        except ValueError as exc:
            raise UpstreamEvidenceError('non_numeric_measurement_row') from exc
        if (not math.isfinite(frequency) or not math.isfinite(amplitude)
                or not 10 <= frequency <= 30_000 or not -200 <= amplitude <= 200
                or frequency <= previous):
            raise UpstreamEvidenceError('invalid_frequency_or_amplitude')
        previous = frequency
        points.append({'frequency_hz': frequency, 'relative_amplitude_db': amplitude})
        if len(points) > MAX_POINTS:
            raise UpstreamEvidenceError('too_many_measurements')
    if len(points) < 4:
        raise UpstreamEvidenceError('insufficient_curve_points')
    return {'filename': file_name, 'protocol_label': match.group(1),
            'model_label_unverified': match.group(2), 'channel': match.group(3),
            'response_basis': 'SBAF compensated, normalised frequency response (NOT absolute dB SPL)',
            'point_count': len(points), 'points': points}


def collect(get: Callable[[str], bytes], files: list[str], commit: str | None = None) -> dict:
    if not files or len(files) > 12 or len(files) != len(set(files)):
        raise UpstreamEvidenceError('invalid_file_selection')
    for file_name in files:
        if not isinstance(file_name, str) or not FILENAME_RE.fullmatch(file_name):
            raise UpstreamEvidenceError('invalid_measurement_filename')
    pin = commit or resolve_pinned_commit(get)
    if not SHA_RE.fullmatch(pin):
        raise UpstreamEvidenceError('invalid_commit_pin')
    curves = []
    for file_name in files:
        url = f'{API_ROOT}/contents/{urllib.parse.quote(file_name, safe="")}?ref={pin}'
        data, blob_sha = decode_github_file(get(url), file_name)
        parsed = parse_frequency_curve(file_name, data)
        parsed.update({'source_blob_sha1': blob_sha,
                       'source_sha256': hashlib.sha256(data).hexdigest(),
                       'original_source_url': f'{SOURCE_URL}/blob/{pin}/{file_name}'})
        curves.append(parsed)
    return {
        'source_type': 'first_party_measurement_repository',
        'source_repository': SOURCE_URL, 'api_origin': API_ROOT,
        'immutable_source_commit': pin,
        'published_license': LICENSE_ID,
        'license_url': SOURCE_LICENSE_URL,
        'required_attribution': f'SBAF Headphone Measurements Repository; {LICENSE_ID}; {SOURCE_URL}',
        'rights_note': 'Publisher states CC BY 4.0. Check file-level provenance and rights before public re-use.',
        'observed_at': datetime.now(timezone.utc).isoformat(),
        'research_only': True, 'ranking_input_approved': False,
        'real_market_variant_match_verified': False,
        'source_curation': 'Measurements use multiple rigs/compensation versions; protocol differences cannot be merged.',
        'curves': curves,
        'comparable_curve_groups': [
            {'protocol_label': protocol, 'filenames': sorted(x['filename'] for x in curves if x['protocol_label'] == protocol)}
            for protocol in sorted(set(x['protocol_label'] for x in curves))
            if sum(x['protocol_label'] == protocol for x in curves) >= 2
        ],
        'warnings': [
            'Comparability within the same protocol label is provisional; review rig calibration and test conditions.',
            'Frequency response alone cannot establish overall headphone quality, comfort, ANC or microphone performance.',
            'The filename is not a verified UK GTIN/MPN and cannot guarantee exact retail variant identity.',
            'Attribution, adaptations, original creator credits and any additional file-level rights must be reviewed.',
            'No data enters the public recommendation engine or commercial purchase-link resolver.',
        ]
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description='Direct first-party headphone test data via GitHub API; research only')
    parser.add_argument('--file', action='append', required=True, dest='files', help='Root .txt filename (repeatable, max 12)')
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--commit', help='Optional immutable 40-hex SHA; otherwise master is resolved to a SHA first')
    args = parser.parse_args(argv)
    import os
    token = os.environ.get('GITHUB_TOKEN')
    def get(url):
        return _fetch_api(url, token)
    try:
        outcome = collect(get, args.files, args.commit)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(_json_bytes(outcome))
        print(f"Research intake: {len(outcome['curves'])} original measurement file(s), pinned commit {outcome['immutable_source_commit']}. No ranking.")
    except UpstreamEvidenceError as exc:
        print('INTAKE BLOCKED:', exc, file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
