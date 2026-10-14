"""Evidence replay and evaluation gates for phase 84.

Research/evaluation only. Does not fetch websites or create commercial legal permissions.
A 'source_declared' licence never proves that the host permits automated crawling.
Do not attach a live crawler until current access/rights checks pass independently.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
MAX_BYTES = 1_000_000
SAMPLE_MANIFEST = Path(__file__).with_name('authentic_source_manifest.json')

class ReplayDenied(ValueError):
    pass


def _project_path(raw: str, root: Path) -> Path:
    if not isinstance(raw, str) or not raw or '\\' in raw:
        raise ReplayDenied('invalid_payload_path')
    rel = Path(raw)
    if rel.is_absolute() or '..' in rel.parts or rel.parts[0].startswith('.'):
        raise ReplayDenied('payload_path_outside_workspace')
    unresolved = root.joinpath(rel)
    if any(segment.is_symlink() for segment in (unresolved, *unresolved.parents) if segment != root and segment.is_relative_to(root)):
        raise ReplayDenied('symlinked_payload_path')
    target = unresolved.resolve()
    if not target.is_relative_to(root.resolve()) or not target.is_file():
        raise ReplayDenied('payload_file_not_authorized')
    return target


def validate_manifest(manifest: dict[str, Any], root: Path = ROOT) -> tuple[bytes, dict]:
    """Validates a previously supplied authorized local sample; does not grant rights.

    Human approval remains a separate action. A source-declared licence alone is
    NOT clearance for network automation or every downstream use.
    """
    required = ('source_id', 'source_url', 'publisher', 'attribution', 'licence_url',
                'content_path', 'content_sha256', 'sample_kind', 'capture_route',
                'purpose', 'sampling_limitations')
    if not isinstance(manifest, dict) or any(not isinstance(manifest.get(x), str) or not manifest[x].strip() for x in required):
        raise ReplayDenied('missing_source_provenance')
    if not str(manifest['source_url']).startswith('https://') or not str(manifest['licence_url']).startswith('https://'):
        raise ReplayDenied('unverifiable_source_urls')
    if manifest['capture_route'] != 'pre_existing_local_fixture' or manifest['purpose'] != 'offline_evaluation_only':
        raise ReplayDenied('live_retrieval_not_authorized_by_replay_manifest')
    if manifest['sample_kind'] not in ('authentic_partial_measurement_excerpt','authorized_html_snapshot'):
        raise ReplayDenied('unknown_sample_kind')
    file_path = _project_path(manifest['content_path'], root)
    if file_path.stat().st_size > MAX_BYTES:
        raise ReplayDenied('sample_size_limit')
    payload = file_path.read_bytes()
    digest = hashlib.sha256(payload).hexdigest()
    if not re.fullmatch(r'[0-9a-f]{64}',manifest['content_sha256']) or digest != manifest['content_sha256']:
        raise ReplayDenied('sample_hash_mismatch')
    return payload, {'source_id': manifest['source_id'], 'sha256': digest,
                     'source_url': manifest['source_url'], 'attribution': manifest['attribution'],
                     'licence_url': manifest['licence_url'], 'capture_route': manifest['capture_route'],
                     'purpose': manifest['purpose'], 'sample_kind': manifest['sample_kind'],
                     'sampling_limitations': manifest['sampling_limitations'],
                     'network_access_tested': False, 'live_crawling_authorized': False}


def parse_frequency_rows(payload: bytes) -> list[tuple[float,float]]:
    """Read a bounded measured excerpt; does not infer sound quality or preference."""
    try: source = payload.decode('ascii')
    except UnicodeError: raise ReplayDenied('non_ascii_measurement_data') from None
    lines = source.strip().splitlines()
    if not 4 <= len(lines) <= 696:
        raise ReplayDenied('unsupported_measurement_sample_size')
    rows = []
    for line in lines:
        if not re.fullmatch(r'\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?', line.strip()):
            raise ReplayDenied('malformed_measurement_line')
        frequency, response = (float(t) for t in line.split())
        if not (10 <= frequency <= 25000) or not (-100 <= response <= 100):
            raise ReplayDenied('implausible_units_or_range')
        if rows and rows[-1][0] >= frequency:
            raise ReplayDenied('non_increasing_frequency')
        rows.append((frequency,response))
    return rows


def assess_measurement_excerpt(manifest: dict, root: Path = ROOT) -> dict:
    payload, provenance = validate_manifest(manifest,root)
    if provenance['sample_kind'] != 'authentic_partial_measurement_excerpt':
        raise ReplayDenied('wrong_parser_for_sample')
    rows = parse_frequency_rows(payload)
    expected = manifest.get('locked_reference_points')
    if not isinstance(expected, list) or not expected or len(expected) > 696:
        raise ReplayDenied('no_locked_reference_values')
    if any(not isinstance(x,list) or len(x)!=2 or any(type(v) not in (float,int) for v in x) for x in expected):
        raise ReplayDenied('invalid_reference_format')
    reference = {(float(a),float(b)) for a,b in expected}
    extracted = set(rows)
    if len(extracted) != len(rows):
        raise ReplayDenied('duplicated_measurement')
    tp = len(reference & extracted); fp=len(extracted-reference); fn=len(reference-extracted)
    return {'provenance':provenance,'measured_points':len(rows),'locked_reference_count':len(reference),
            'true_positives':tp,'false_positives':fp,'false_negatives':fn,
            'precision':tp/(tp+fp) if tp+fp else None,
            'recall':tp/(tp+fn) if tp+fn else None,
            'semantic_ai_evaluated':False,'actual_crawler_used':False,
            'validity':'AUTHENTIC PARTIAL SOURCE PARSER REGRESSION ONLY — not a real-web acquisition or product verdict',
            'suitable_for_product_verdict':False}


def compare_arms(arms: dict[str,dict], required_cases: list[str]) -> dict:
    """Locked denominators and strict status reporting; do not hide blocked cases.

    Inputs are measured case records exported from an external controlled run.
    A result marked 'run' with zero recorded cases is not comparative evidence.
    """
    required = set(required_cases)
    if not required or len(required) != len(required_cases):
        raise ReplayDenied('invalid_locked_case_set')
    summaries = {}
    validity_reasons = []
    for name in ('inhouse','crawl4ai'):
        arm = arms.get(name)
        if not isinstance(arm, dict) or arm.get('state') != 'run':
            validity_reasons.append(f'{name}_not_run')
            summaries[name] = {'status':'not_run','completed':0,'required':len(required)}
            continue
        cases=arm.get('cases')
        if not isinstance(cases,list) or any(not isinstance(x,dict) for x in cases):
            raise ReplayDenied('invalid_case_records')
        ids = [x.get('page') for x in cases]
        if len(ids)!=len(set(ids)) or set(ids)!=required:
            validity_reasons.append(f'{name}_incomplete_or_extra_cases')
        ok = [x for x in cases if x.get('status') == 'ok']
        untested = sorted(set(required)-{x['page'] for x in ok if x.get('page') in required})
        if untested: validity_reasons.append(f'{name}_missing_or_failed_case')
        for x in ok:
            for k in ('true_positives','false_positives','false_negatives'):
                if type(x.get(k)) is not int or x[k] < 0:
                    raise ReplayDenied('invalid_nonnegative_count')
        tp=sum(x['true_positives'] for x in ok);fp=sum(x['false_positives'] for x in ok);fn=sum(x['false_negatives'] for x in ok)
        summaries[name]={
          'status':'run_with_blockers' if untested else 'complete', 'completed':len(ok),
          'required':len(required),'untested_cases':untested,
          'tp_on_completed':tp,'fp_on_completed':fp,'fn_on_completed':fn,
          'precision_on_completed':tp/(tp+fp) if tp+fp else None,
          'recall_on_completed':tp/(tp+fn) if tp+fn else None,
          'full_corpus_recall':'UNAVAILABLE_WHEN_CASES_BLOCKED' if untested else (tp/(tp+fn) if tp+fn else None)}
    valid=not validity_reasons
    return {'comparison_valid':valid,'reasons':sorted(set(validity_reasons)),
            'scores':summaries,'decision': 'INSUFFICIENT COMPARATIVE EVIDENCE' if not valid else 'COMPARISON POSSIBLE; COST, SECURITY, RIGHTS AND MAINTENANCE REVIEW STILL REQUIRED'}


def main(argv: list[str]|None=None)->int:
    p=argparse.ArgumentParser(description='Offline evidence replay and impartial comparison readiness checker')
    p.add_argument('--manifest',type=Path,default=SAMPLE_MANIFEST)
    p.add_argument('--output',type=Path)
    p.add_argument('--comparison',type=Path,help='JSON with arms and required_cases from an independently executed A/B run')
    args=p.parse_args(argv)
    try:
        if args.comparison:
            source=json.loads(args.comparison.read_text())
            output=compare_arms(source['arms'], source['required_cases'])
        else:
            output=assess_measurement_excerpt(json.loads(args.manifest.read_text()))
    except (ValueError,KeyError,OSError) as exc:
        print('REPLAY BLOCKED: '+str(exc), file=sys.stderr)
        return 2
    result=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(result)
    print(result)
    return 0

if __name__ == '__main__': raise SystemExit(main())
