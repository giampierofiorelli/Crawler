#!/usr/bin/env python3
"""Explicitly opted-in, OFFLINE local GLiNER2 inference adapter.

Only a caller-provided, preexisting local checkpoint is accepted.  No remote
repository IDs, download, or remote inference. Output is an unverified hypothesis.
Optional dependencies are not installed or vendored by PEE.
"""
import argparse, hashlib, json, os, pathlib, sys, time

def fail(message):
    print('phase158: '+message,file=sys.stderr)
    raise SystemExit(2)

def run(args):
    root=pathlib.Path(args.model_dir).expanduser().resolve()
    if not root.is_dir():fail('checkpoint_directory_missing')
    files=[p for p in root.rglob('*') if p.is_file()]
    if not files or len(files)>500:fail('invalid_checkpoint_file_count')
    if not any(p.suffix in ('.safetensors','.bin') for p in files):fail('model_weights_not_found')
    if any(p.is_symlink() and not p.resolve().is_relative_to(root) for p in files):fail('checkpoint_symlink_outside_directory')
    if args.source_file=='-': raw=sys.stdin.buffer.read(500_001)
    else:raw=pathlib.Path(args.source_file).read_bytes()
    if len(raw)>500_000:fail('source_size_budget_exceeded')
    try:source=raw.decode('utf-8')
    except UnicodeDecodeError:fail('source_must_be_utf8')
    if not source.strip():fail('empty_source')
    # Set before importing the model stack; should NEVER trigger a download.
    os.environ['HF_HUB_OFFLINE']='1'
    os.environ['TRANSFORMERS_OFFLINE']='1'
    os.environ['HF_DATASETS_OFFLINE']='1'
    os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
    try:from gliner2 import AutoExtractor
    except Exception as exc:fail('gliner2_local_dependencies_not_installed:'+type(exc).__name__)
    start=time.perf_counter()
    try:
        model=AutoExtractor.from_pretrained(str(root))
        out=model.extract_entities_long(source,
          {'product':'Full commercial product names, specific models and named variants in this review',
           'brand':'Brand names of commercial products'},
          chunk_size=384,chunk_overlap=64,include_spans=True,include_confidence=True)
    except Exception as exc:fail('local_model_inference_failed:'+type(exc).__name__)
    raw_entities=out.get('entities',{}) if isinstance(out,dict) else {}
    predictions=[]
    for label in ('product','brand'):
        for x in raw_entities.get(label,[]):
            if not isinstance(x,dict):continue
            s=x.get('start');e=x.get('end');name=x.get('text')
            conf=x.get('confidence')
            if isinstance(s,int) and isinstance(e,int) and 0<=s<e<=len(source) and source[s:e]==name:
                predictions.append({'start':s,'end':e,'surface':name,'label':label,
                    'confidence':float(conf) if isinstance(conf,(float,int)) and 0<=conf<=1 else None})
    result={'phase':158,'runtime':'offline_local_gliner2','sourceSha256':hashlib.sha256(raw).hexdigest(),
       'modelId':root.name,'modelDirectory':str(root),'checkpointFilesystemVerified':True,
       'weightsSha256':None,'checkpointLicenceVerified':False,
       'elapsedSeconds':round(time.perf_counter()-start,3),
       'predictions':predictions[:500],
       'truncated':len(predictions)>500,'scientificEvidence':False,'identityMergeAuthorized':False,
       'rankingAuthorized':False}
    print(json.dumps(result,ensure_ascii=False))

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--model-dir',required=True)
    ap.add_argument('--source-file',required=True,help='UTF-8 file or - for stdin')
    run(ap.parse_args())
