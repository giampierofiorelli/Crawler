#!/usr/bin/env python3
"""Optional local/offline GLiNER2.5 batch adapter.

Input: Phase160 rights-scoped JSON manifest. Output: Phase160 external
unverified neural hypotheses. No automatic weights download, DB, ranking, API.
Dependencies (gliner2 + torch) ONLY when opted into executing a real checkpoint.
"""
import argparse, hashlib, json, os, pathlib, sys, time

LABELS = {
    "product_model": "A specific commercially sold product model or model identifier, including its brand",
    "brand": "Manufacturer or consumer product brand name",
    "product_feature": "Physical product component or operational feature",
    "measured_value": "Numerical test result with its measurement unit",
}


def sha(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def utf16_offset(text, python_index):
    """Convert Python Unicode code point boundary to JS String.slice UTF-16 boundary."""
    return len(text[:python_index].encode('utf-16-le')) // 2


def character_windows(text, size=1000, overlap=125):
    if not 300 <= size <= 4000 or not 0 <= overlap < size // 2:
        raise ValueError('invalid_window_budget')
    pos = 0
    while pos < len(text):
        end = min(len(text), pos + size)
        if end < len(text):
            boundary = max(text.rfind(' ', pos + size // 2, end), text.rfind('\n', pos + size // 2, end))
            if boundary > pos: end = boundary + 1
        yield pos, text[pos:end]
        if end == len(text): break
        pos = max(pos + 1, end - overlap)


def infer_document(model, text, size=1000, overlap=125, max_spans=500):
    entities = {label: [] for label in LABELS}
    visited = {}
    errors = []
    count = 0
    start = time.perf_counter()
    for base, chunk in character_windows(text, size, overlap):
        reply = model.extract_entities(chunk, LABELS, include_confidence=True, include_spans=True)
        for label, spans in reply.get('entities', {}).items():
            if label not in entities:
                errors.append({'reason': 'unexpected_label', 'label': label})
                continue
            for span in spans:
                a, b = span.get('start'), span.get('end')
                surface, confidence = span.get('text'), span.get('confidence')
                if not (type(a) is int and type(b) is int and 0 <= a < b <= len(chunk)
                        and chunk[a:b] == surface and type(confidence) in (int,float)
                        and 0 <= confidence <= 1):
                    errors.append({'reason': 'invalid_source_span', 'label': label})
                    continue
                pa, pb = base + a, base + b
                key = (label, pa, pb)
                item = {'text': surface, 'confidence': float(confidence),
                        'start': utf16_offset(text, pa), 'end': utf16_offset(text, pb)}
                if key not in visited or item['confidence'] > visited[key]['confidence']:
                    visited[key] = item
                count += 1
                if count > max_spans * 10:
                    errors.append({'reason': 'candidate_generation_budget_exceeded'})
                    break
            if count > max_spans * 10: break
        if count > max_spans * 10: break
    for (label, _, _), item in sorted(visited.items(), key=lambda pair:(pair[1]['start'],pair[1]['end'],pair[0][0])):
        entities[label].append(item)
    if len(visited) > max_spans or any(len(e)>200 for e in entities.values()):
        errors.append({'reason': 'candidate_output_budget_exceeded'})
    return {'entities': entities, 'seconds_inference': round(time.perf_counter()-start,3),
            'offset_errors': errors, 'windowing':{'size':size,'overlap':overlap,'candidateCount':len(visited)}}


def execute(manifest, model):
    if manifest.get('protocol') != 'pee.phase160.batch.v1':raise ValueError('invalid_manifest_protocol')
    docs=manifest.get('documents',[])
    if not (isinstance(docs,list) and 0 < len(docs) <= 100):raise ValueError('document_count_out_of_bounds')
    cases={}
    for doc in docs:
        text=doc['text'];id=doc['id']
        if not id.isascii() or not all(c.islower() or c.isdigit() or c=='_' for c in id) or len(id)>50:
            raise ValueError('invalid_case_id')
        if not (isinstance(text,str) and text.strip() and len(text)<=120000 and sha(text)==doc['sha256']):
            raise ValueError('source_digest_invalid')
        if doc['kind']=='rights_permitted_full_review' and doc.get('rightsBasis') not in ('document_owner','permission_granted','public_domain'):
            raise ValueError('full_review_rights_declaration_missing')
        if doc['kind']=='published_short_excerpt' and (len(text)>500 or doc.get('rightsBasis')!='short_citation_research'):
            raise ValueError('short_excerpt_contract_invalid')
        if doc['kind']=='constructed' and doc.get('rightsBasis')!='constructed_original':
            raise ValueError('constructed_rights_invalid')
        result=infer_document(model,text)
        cases[id]={'input':text,'source_url':doc['sourceUrl'],'source_title':doc['sourceTitle'],
                   'source_sha256':sha(text),**result}
    return {'experiment':'PEE Phase160 bounded batch local GLiNER2.5 (unverified hypotheses)',
            'model_id':'fastino/gliner2.5-small-v1','model_architecture':'boundary',
            'gliner2_version':__import__('importlib.metadata',fromlist=['version']).version('gliner2'),
            'model_integration_status':'standalone_colab_not_connected_to_PEE',
            'case_status':'mixed_batch_provisional_unannotated', 'cases':cases}


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--manifest',required=True);p.add_argument('--model-dir',required=True)
    p.add_argument('--out',required=True)
    args=p.parse_args()
    root=pathlib.Path(args.model_dir).resolve()
    if not root.is_dir() or not any(x.suffix=='.safetensors' for x in root.rglob('*') if x.is_file()):
        raise SystemExit('A pre-downloaded local checkpoint directory is required; no automatic remote downloads')
    os.environ['HF_HUB_OFFLINE']='1';os.environ['TRANSFORMERS_OFFLINE']='1'
    from gliner2 import AutoExtractor
    model=AutoExtractor.from_pretrained(str(root),map_location='cpu')
    result=execute(json.loads(pathlib.Path(args.manifest).read_text()),model)
    pathlib.Path(args.out).write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print('Wrote external batch result:',args.out,'cases:',len(result['cases']))

if __name__=='__main__':main()
