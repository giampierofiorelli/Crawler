#!/usr/bin/env python3
"""PEE Phase161: offline, reusable GLiNER2.5 batch executor.

An opt-in trusted-machine process: no network, HTTP listener, remote APIs,
model redistribution, DB updates, automatic ranking, or identity approval.
Checkpoint and rights lock are *operator attestations*, not external certification.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import time
from typing import Any, Callable

# Reuse the source-aligned extraction and overlap logic of the existing PEE adapter.
from phase160_gliner_batch import LABELS, infer_document, sha, utf16_offset

MODEL_ID = 'fastino/gliner2.5-small-v1'
WORKER_PROTOCOL = 'pee.phase161.worker.v1'
REQUIRED_FILES = ('config.json', 'tokenizer.json', 'tokenizer_config.json', 'model.safetensors')
RIGHTS = {'constructed': {'constructed_original'},
          'published_short_excerpt': {'short_citation_research'},
          'rights_permitted_full_review': {'document_owner', 'permission_granted', 'public_domain'}}
IDENT = re.compile(r'^[a-z0-9_]{1,50}$')


def digest_bytes(blob: bytes) -> str:
    return hashlib.sha256(blob).hexdigest()


def fingerprint_checkpoint(root: Path) -> dict:
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError('checkpoint_not_a_directory')
    files = list(root.rglob('*'))
    if len(files) > 200:
        raise ValueError('checkpoint_file_budget_exceeded')
    if any(p.is_symlink() for p in files):
        raise ValueError('checkpoint_symlinks_disallowed')
    for required in REQUIRED_FILES:
        if not (root / required).is_file():
            raise ValueError('checkpoint_missing_' + required)
    hashes = {}
    for path in sorted(p for p in files if p.is_file()):
        relative = path.relative_to(root).as_posix()
        if path.stat().st_size > 1_000_000_000:
            raise ValueError('checkpoint_file_too_large')
        h = hashlib.sha256()
        with path.open('rb') as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b''):
                h.update(chunk)
        hashes[relative] = h.hexdigest()
    combined = digest_bytes(json.dumps(hashes, sort_keys=True, separators=(',', ':')).encode())
    config = json.loads((root / 'config.json').read_text(encoding='utf-8'))
    if config.get('architecture') != 'boundary' or config.get('model_type') != 'gliner2':
        raise ValueError('unexpected_checkpoint_architecture')
    return {'model_id': MODEL_ID, 'architecture': 'boundary',
            'files': hashes, 'checkpoint_fingerprint': combined}


def verify_operator_lock(fingerprint: dict, lock: dict) -> None:
    if lock.get('protocol') != WORKER_PROTOCOL or lock.get('model_id') != MODEL_ID:
        raise ValueError('checkpoint_operator_lock_invalid')
    if lock.get('checkpoint_fingerprint') != fingerprint['checkpoint_fingerprint']:
        raise ValueError('checkpoint_fingerprint_mismatch')
    if lock.get('declared_license') != 'Apache-2.0' or lock.get('rights_reviewed_by_operator') is not True:
        raise ValueError('checkpoint_rights_not_attested')
    # This is an operator lock, not an assertion that the owner or license was independently authenticated.


def validate_manifest(manifest: dict) -> list[dict]:
    if not isinstance(manifest, dict) or manifest.get('protocol') != 'pee.phase160.batch.v1' or not IDENT.fullmatch(str(manifest.get('datasetId', ''))):
        raise ValueError('invalid_dataset_contract')
    docs = manifest.get('documents')
    if not isinstance(docs, list) or not (1 <= len(docs) <= 100):
        raise ValueError('invalid_document_count')
    seen = set()
    for doc in docs:
        if not isinstance(doc, dict) or not isinstance(doc.get('id'), str) or not IDENT.fullmatch(doc['id']) or doc['id'] in seen:
            raise ValueError('invalid_or_duplicate_document_id')
        seen.add(doc['id'])
        if doc.get('kind') not in RIGHTS or doc.get('rightsBasis') not in RIGHTS[doc['kind']]:
            raise ValueError('unaccepted_source_rights_declaration:' + doc['id'])
        if not isinstance(doc.get('rightsStatement'), str) or not (8 <= len(doc['rightsStatement']) <= 500):
            raise ValueError('missing_rights_statement')
        if doc.get('sourceRole') not in ('original_product_test', 'manufacturer_specification', 'original_expert_method', 'user_problem_report'):
            raise ValueError('invalid_source_role')
        if not isinstance(doc.get('sourceTitle'), str) or not doc['sourceTitle'].strip() or len(doc['sourceTitle']) > 300:
            raise ValueError('invalid_title')
        if not isinstance(doc.get('sourceUrl'), str) or not re.fullmatch(r'https://[A-Za-z0-9][A-Za-z0-9.-]+/[A-Za-z0-9/?=&%_.+\-#]*',doc['sourceUrl']) or len(doc['sourceUrl'])>2000:
            raise ValueError('invalid_source_url')
        if not isinstance(doc.get('category'), str) or not (0<len(doc['category'].strip())<=70):
            raise ValueError('invalid_category')
        text = doc.get('text')
        if not isinstance(text, str) or not text.strip() or utf16_offset(text, len(text)) > 120000:
            raise ValueError('invalid_document_length')
        if doc['kind'] == 'published_short_excerpt' and utf16_offset(text,len(text)) > 500:
            raise ValueError('publisher_excerpt_budget_exceeded')
        if doc.get('sha256') != sha(text) or doc.get('independentGoldAvailable') is True:
            raise ValueError('source_hash_or_gold_declaration_invalid')
    return docs


def safe_cache_result(result: dict, text: str, require_relations: bool = False) -> bool:
    if result.get('offset_errors') or set(result.get('entities', {})) != set(LABELS):
        return False
    count = 0
    for label, entries in result['entities'].items():
        if not isinstance(entries, list) or len(entries)>200:
            return False
        for span in entries:
            a,b=span.get('start'),span.get('end')
            if type(a) is not int or type(b) is not int or a<0 or b<=a or b>utf16_offset(text,len(text)):
                return False
            source = text.encode('utf-16-le')
            if source[a*2:b*2].decode('utf-16-le',errors='replace') != span.get('text'):
                return False
            c=span.get('confidence')
            if type(c) not in (float,int) or not 0 <= c <= 1:
                return False
            count += 1
    if count > 500:
        return False
    rels = result.get('relation_candidates')
    if require_relations and (result.get('relation_extraction_status') != 'local_model_executed_unverified'
                              or not isinstance(rels, list)):
        return False
    if rels is None and result.get('relation_extraction_status') is not None:
        return False
    if rels is not None:
        if result.get('relation_extraction_status') != 'local_model_executed_unverified' or not isinstance(rels,list) or len(rels)>150:
            return False
        from phase163_neural_relations import RELATION_TYPES
        utf16 = text.encode('utf-16-le')
        observed = set()
        for relation in rels:
            if not isinstance(relation,dict) or relation.get('type') not in RELATION_TYPES:
                return False
            if any(relation.get(flag) is not False for flag in ('identityVerified','scientificEvidence','canonicalWriteAuthorized','rankingAuthorized')):
                return False
            parts=[]
            for part in ('head','tail'):
                endpoint=relation.get(part)
                if not isinstance(endpoint,dict):return False
                a,b=endpoint.get('start'),endpoint.get('end')
                if type(a) is not int or type(b) is not int or not 0<=a<b<=len(utf16)//2:return False
                try: surface=utf16[2*a:2*b].decode('utf-16-le',errors='strict')
                except UnicodeDecodeError:return False
                if surface != endpoint.get('text'):return False
                confidence=endpoint.get('confidence')
                if type(confidence) not in (float,int) or not 0<=confidence<=1:return False
                parts.extend([a,b])
            if parts[:2]==parts[2:]:return False
            key=(relation['type'],*parts)
            if key in observed:return False
            observed.add(key)
    return True


def atomic_json(path: Path, payload: dict, overwrite: bool = False) -> None:
    if path.exists() and not overwrite:
        raise FileExistsError('output_exists:' + str(path))
    path.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    fd,name = tempfile.mkstemp(prefix='.phase161-', suffix='.tmp', dir=str(path.parent))
    try:
        with os.fdopen(fd, 'w',encoding='utf-8') as f:
            json.dump(payload,f,ensure_ascii=False,indent=2,sort_keys=True)
            f.write('\n');f.flush();os.fsync(f.fileno())
        os.replace(name,path)
    finally:
        if os.path.exists(name): os.unlink(name)


def run_one_batch(manifest: dict, model: Any, fingerprint: str, cache: Path, version: str,
                  infer: Callable = infer_document, with_relations: bool = False) -> tuple[dict,dict]:
    docs = validate_manifest(manifest)
    cases={}; failures={}; cache_hits=0; inferred=0
    implementation_digest=digest_bytes(Path(__file__).read_bytes() + (Path(__file__).parent/'phase160_gliner_batch.py').read_bytes() + (Path(__file__).parent/'phase163_neural_relations.py').read_bytes())
    cache.mkdir(parents=True,exist_ok=True,mode=0o700)
    for doc in docs:
        case_id = doc['id']; text=doc['text']
        cache_key = sha(json.dumps({'protocol':WORKER_PROTOCOL,'model':fingerprint,'implementation':implementation_digest,'labels':LABELS,
                                    'text_sha':doc['sha256'],'window_size':1000,'overlap':125,'with_relations':with_relations},sort_keys=True))
        path = cache / (cache_key+'.json')
        result = None
        if path.is_file() and not path.is_symlink():
            try:
                cached=json.loads(path.read_text(encoding='utf-8'))
                if cached.get('protocol')==WORKER_PROTOCOL and cached.get('cache_key')==cache_key and safe_cache_result(cached['result'],text,require_relations=with_relations):
                    result=dict(cached['result']);result['seconds_inference']=0.0;result['cache_reused']=True;cache_hits+=1
            except (ValueError, TypeError, KeyError, OSError):
                pass
        try:
            if result is None:
                result=infer(model,text)
                inferred+=1
                if not safe_cache_result(result,text,require_relations=with_relations):
                    raise ValueError('neural_result_invalid_or_truncated')
                atomic_json(path,{'protocol':WORKER_PROTOCOL,'cache_key':cache_key,'result':result},overwrite=True)
            cases[case_id]={'input':text, 'source_url':doc['sourceUrl'],
                            'source_title':doc['sourceTitle'],'source_sha256':doc['sha256'], **result}
        except Exception as exc:
            failures[case_id]=type(exc).__name__ + ':' + str(exc)[:150]
    report={'experiment':'PEE Phase161 local offline neural hypotheses (not independent evidence)',
            'model_id':MODEL_ID,'model_architecture':'boundary','gliner2_version':version,
            'model_integration_status':'local_offline_worker_not_connected_to_PEE',
            'case_status':'mixed_batch_provisional_unannotated','cases':cases}
    audit={'protocol':WORKER_PROTOCOL,'datasetId':manifest['datasetId'],
           'checkpoint_fingerprint':fingerprint,'processor_digest':implementation_digest,'checkpointAuthenticated':False,
           'modelRightsIndependentlyVerified':False,'modelQualityBenchmark':False,
           'scientificEvidenceApproved':False,'identityMergeAuthorized':False,'rankingAuthorized':False,
           'processed':len(cases),'failures':failures,'cacheHits':cache_hits,'freshInferCalls':inferred,
           'totalDocuments':len(docs),'document_sha256':{d['id']:d['sha256'] for d in docs}}
    return report,audit


def load_model(checkpoint: Path):
    os.environ['HF_HUB_OFFLINE']='1'
    os.environ['TRANSFORMERS_OFFLINE']='1'
    os.environ['HF_DATASETS_OFFLINE']='1'
    os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
    from gliner2 import AutoExtractor
    return AutoExtractor.from_pretrained(str(checkpoint),map_location='cpu')


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--model-dir',required=True)
    p.add_argument('--operator-lock')
    p.add_argument('--cache-dir')
    p.add_argument('--with-relations',action='store_true',help='Use opt-in GLiNER2.5 relation decoder as unverified candidates')
    p.add_argument('--inspect-only',action='store_true',help='Print the SHA-256 checkpoint inventory without loading the neural model')
    p.add_argument('--manifest')
    p.add_argument('--out')
    p.add_argument('--audit')
    p.add_argument('--watch-dir')
    p.add_argument('--watch-out-dir')
    p.add_argument('--poll-seconds',type=float,default=5)
    p.add_argument('--max-jobs',type=int,default=0,help='0 = keep watching until stopped')
    args=p.parse_args(argv)
    if args.inspect_only:
        print(json.dumps(fingerprint_checkpoint(Path(args.model_dir)),sort_keys=True,indent=2))
        return 0
    if not args.operator_lock or not args.cache_dir:
        p.error('--operator-lock and --cache-dir are required for execution')
    if bool(args.manifest)!=bool(args.out) or bool(args.manifest)==bool(args.watch_dir):
        p.error('choose exactly one of --manifest/--out or --watch-dir/--watch-out-dir')
    if (args.watch_dir and not args.watch_out_dir) or (args.manifest and not args.audit):
        p.error('provide an audit destination or watch output directory')
    if args.manifest:
        # Validate every source before spending resources on a pretrained checkpoint.
        validate_manifest(json.loads(Path(args.manifest).read_text(encoding='utf-8')))
    fingerprint=fingerprint_checkpoint(Path(args.model_dir))
    lock=json.loads(Path(args.operator_lock).read_text(encoding='utf-8'))
    verify_operator_lock(fingerprint,lock)
    model=load_model(Path(args.model_dir))
    version=importlib.metadata.version('gliner2')
    cache=Path(args.cache_dir)
    extractor = infer_document
    if args.with_relations:
        from phase163_neural_relations import extract_relations_163
        def extractor(model, text):
            output = infer_document(model,text)
            # A failed relation pass fails this document, never silently implies no relations.
            output.update(extract_relations_163(model,text))
            return output
    if args.manifest:
        manifest=json.loads(Path(args.manifest).read_text(encoding='utf-8'))
        report,audit=run_one_batch(manifest,model,fingerprint['checkpoint_fingerprint'],cache,version,infer=extractor,with_relations=args.with_relations)
        atomic_json(Path(args.out),report)
        atomic_json(Path(args.audit),audit)
        print(json.dumps({'processed':audit['processed'],'failures':len(audit['failures']),'cacheHits':audit['cacheHits']}))
        return 0 if not audit['failures'] else 3
    inbox=Path(args.watch_dir).resolve();out=Path(args.watch_out_dir).resolve()
    if inbox==out or not inbox.is_dir():
        p.error('watch input/output directories must be distinct and input must exist')
    out.mkdir(parents=True,exist_ok=True,mode=0o700)
    jobs=0
    while True:
        for job in sorted(inbox.glob('*.json')):
            if not IDENT.fullmatch(job.stem) or job.is_symlink() or (out/(job.stem+'.audit.json')).exists() or (out/(job.stem+'.error.json')).exists():continue
            try:
                manifest=json.loads(job.read_text(encoding='utf-8'))
                report,audit=run_one_batch(manifest,model,fingerprint['checkpoint_fingerprint'],cache,version,infer=extractor,with_relations=args.with_relations)
                if audit['datasetId']!=job.stem:raise ValueError('manifest_filename_dataset_mismatch')
                atomic_json(out/(job.stem+'.neural.json'),report)
                atomic_json(out/(job.stem+'.audit.json'),audit)
            except Exception as exc:
                atomic_json(out/(job.stem+'.error.json'),{'error':type(exc).__name__+':'+str(exc)[:250]},overwrite=True)
            jobs+=1
            if args.max_jobs and jobs>=args.max_jobs:return 0
        time.sleep(max(1,args.poll_seconds))

if __name__=='__main__':sys.exit(main())
