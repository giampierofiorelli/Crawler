"""Offline-only *optional* model probe. No automatic download or pip installation.
An independently reviewed, locally present checkpoint plus a FULL exact-file manifest
is required before loading third-party code. Raw outputs are research proposals only.
This runner never updates canonical knowledge, evidence or product rankings.
"""
import argparse
import hashlib
import json
import os
import re
from pathlib import Path
from typing import Any

MODEL_ID = 'fastino/gliner2.5-small-v1'
ACCEPTED = {'Apache-2.0', 'MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'CC0-1.0'}
RELATIONS = ['measures', 'contributes_to', 'conditioned_on', 'not_evidence_of']


def sha_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def preflight(checkpoint: Path, manifest: dict) -> list[str]:
    reasons = []
    if not checkpoint.is_dir():
        return ['local_checkpoint_not_present']
    if checkpoint.is_symlink():
        return ['checkpoint_is_symlink']
    if manifest.get('model_id') != MODEL_ID:
        reasons.append('model_id_mismatch')
    if not manifest.get('reviewer_approved') or not str(manifest.get('review_reference', '')).strip():
        reasons.append('independent_licence_review_missing')
    if not manifest.get('offline_only'):
        reasons.append('offline_only_required')
    declared = manifest.get('files', {})
    if not isinstance(declared, dict) or not declared:
        reasons.append('missing_exact_files_manifest')
        declared = {}
    actual = set()
    for p in checkpoint.rglob('*'):
        if p.is_symlink():
            reasons.append('file_symlink_not_allowed')
        if p.is_file():
            actual.add(p.relative_to(checkpoint).as_posix())
    if actual != set(declared):
        reasons.append('checkpoint_file_inventory_mismatch')
    for rel, info in declared.items():
        p = checkpoint / rel
        if (not isinstance(info, dict) or not re.fullmatch(r'[a-f0-9]{64}', str(info.get('sha256', ''))) or
            info.get('license') not in ACCEPTED or not info.get('commercial_use_confirmed') or
            not info.get('licence_url', '').startswith('https://') or
            not info.get('notice_preserved') or info.get('permission_required') or
            info.get('fee_required') or (not p.is_file()) or p.is_symlink() or
            not p.resolve().is_relative_to(checkpoint.resolve())):
            reasons.append('unapproved_or_invalid_file:' + rel)
        elif sha_file(p) != info['sha256']:
            reasons.append('checkpoint_digest_mismatch:' + rel)
    # Dependency list must be an explicit *transitive* inventory and checked in the environment.
    deps = manifest.get('all_runtime_dependencies')
    if not isinstance(deps, list) or not deps:
        reasons.append('runtime_dependency_inventory_missing')
    else:
        for dep in deps:
            if not isinstance(dep, dict) or (dep.get('license') not in ACCEPTED or not dep.get('reviewed')
                or not dep.get('commercial_use_confirmed') or not dep.get('installed_version')
                or not dep.get('origin_url', '').startswith('https://') or dep.get('fee_required')
                or dep.get('permission_required')):
                reasons.append('unreviewed_runtime_dependency')
                break
    return sorted(set(reasons))


def unmark(s: str) -> tuple[str, str, str]:
    # Source annotations are supplied externally. This cannot discover entity spans.
    m = re.search(r'<S>([^<]+)</S>', s)
    n = re.search(r'<O>([^<]+)</O>', s)
    if not m or not n or len(re.findall(r'<S>|<O>', s)) != 2:
        raise ValueError('ambiguous_entity_markup')
    text = re.sub(r'</?[SO]>', '', s)
    return text, m.group(1), n.group(1)


def collect_pairs(result: Any) -> list[tuple[str, str, str]]:
    data = result.get('relation_extraction', {}) if isinstance(result, dict) else {}
    pairs = []
    for label, edges in data.items():
        for edge in edges:
            if isinstance(edge, (tuple, list)) and len(edge) == 2:
                pairs.append((label, str(edge[0]), str(edge[1])))
            elif isinstance(edge, dict):
                a, b = edge.get('head'), edge.get('tail')
                a = a.get('text') if isinstance(a, dict) else a
                b = b.get('text') if isinstance(b, dict) else b
                if isinstance(a, str) and isinstance(b, str):
                    pairs.append((label, a, b))
    return pairs


def evaluate_local(model: Any, dataset: dict) -> dict:
    results = []
    for idx, item in enumerate(dataset['records']):
        text, subject, obj = unmark(item['marked'])
        predicted = collect_pairs(model.extract_relations(text, RELATIONS))
        matched = sorted({lab for lab, a, b in predicted if a == subject and b == obj})
        prediction = matched[0] if len(matched) == 1 else 'abstain'
        gold = item['label']
        correct = prediction == gold if gold != 'unrelated' else prediction == 'abstain'
        results.append({'index': idx, 'expected': gold, 'predicted': prediction,
                        'correct': correct, 'matchedRelations': matched,
                        'differentEntityPairs': len(predicted) - len(matched)})
    accepted = [r for r in results if r['predicted'] != 'abstain']
    return {'status': 'executed_local_only', 'dataKind': 'developer_authored_not_blind',
            'size': len(results), 'accepted': len(accepted),
            'acceptedCorrect': sum(r['correct'] for r in accepted),
            'acceptedWrong': sum(not r['correct'] for r in accepted),
            'abstained': len(results) - len(accepted), 'items': results,
            'knowledgeWriteAuthorized': False, 'rankingAuthorized': False}


def run(checkpoint: Path, manifest: dict, dataset: dict) -> dict:
    problems = preflight(checkpoint, manifest)
    if problems:
        return {'status': 'blocked_preflight', 'reasons': problems, 'modelExecuted': False,
                'knowledgeWriteAuthorized': False, 'rankingAuthorized': False}
    # Set guardrails BEFORE importing potentially network-capable libraries.
    os.environ.update({'HF_HUB_OFFLINE': '1', 'TRANSFORMERS_OFFLINE': '1',
                       'HF_DATASETS_OFFLINE': '1', 'HF_HUB_DISABLE_TELEMETRY': '1'})
    try:
        from gliner2 import AutoExtractor
    except (ModuleNotFoundError, ImportError) as exc:
        return {'status': 'blocked_runtime_dependency', 'reasons': [type(exc).__name__, str(exc)],
                'modelExecuted': False, 'knowledgeWriteAuthorized': False, 'rankingAuthorized': False}
    # Local path only; NEVER a remote model name.
    model = AutoExtractor.from_pretrained(str(checkpoint.resolve()))
    return evaluate_local(model, dataset)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--checkpoint', required=True)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--dataset', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    try:
        manifest = json.loads(Path(args.manifest).read_text())
        dataset = json.loads(Path(args.dataset).read_text())
        report = run(Path(args.checkpoint), manifest, dataset)
    except Exception as exc:
        report = {'status': 'execution_failed', 'errorType': type(exc).__name__,
                  'reason': str(exc), 'modelExecuted': False,
                  'knowledgeWriteAuthorized': False, 'rankingAuthorized': False}
    Path(args.output).write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'items'}))


if __name__ == '__main__':
    main()
