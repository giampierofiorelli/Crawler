#!/usr/bin/env python3
"""Opt-in, source-bound relation proposals from the already loaded GLiNER2.5 checkpoint.

Uses the original GLiNER2 local extract_relations API; never confirms product
identity, measurement provenance, comparative superiority or scientific facts.
No network, checkpoint download, train/eval labels, or canonical writes.
"""
import time
from phase160_gliner_batch import character_windows, utf16_offset

RELATION_TYPES = {
    'product_has_feature': 'A specific product model has a named component or feature',
    'feature_has_measurement': 'A measured product feature has a numerical value with units',
    'product_compared_with': 'One product model is compared with a different model',
}


def _endpoint(value, chunk, base, text):
    if not isinstance(value, dict):
        raise ValueError('relation_endpoint_invalid')
    a, b, word = value.get('start'), value.get('end'), value.get('text')
    conf = value.get('confidence', 0)
    if (type(a) is not int or type(b) is not int or not 0 <= a < b <= len(chunk)
            or not isinstance(word, str) or not word or chunk[a:b] != word
            or type(conf) not in (float, int) or not 0 <= conf <= 1):
        raise ValueError('relation_endpoint_unaligned')
    s, e = base + a, base + b
    return {'text': word, 'start': utf16_offset(text, s), 'end': utf16_offset(text, e),
            'confidence': float(conf)}


def extract_relations_163(model, text, size=1000, overlap=125, max_relations=150):
    if not isinstance(text, str) or not text.strip():
        raise ValueError('relation_empty_text')
    if not callable(getattr(model, 'extract_relations', None)):
        raise ValueError('local_model_lacks_relation_api')
    seen = {}; windows = 0; start = time.perf_counter()
    for base, chunk in character_windows(text, size=size, overlap=overlap):
        windows += 1
        response = model.extract_relations(chunk, RELATION_TYPES, include_spans=True,
                                           include_confidence=True)
        if not isinstance(response, dict) or not isinstance(response.get('relation_extraction'), dict):
            raise ValueError('unexpected_relation_api_response')
        relations = response['relation_extraction']
        if not set(relations).issubset(RELATION_TYPES):
            raise ValueError('unexpected_relation_type')
        for label, pairs in relations.items():
            if not isinstance(pairs, list) or len(pairs) > max_relations:
                raise ValueError('relation_window_budget_exceeded')
            for item in pairs:
                if not isinstance(item, dict):
                    raise ValueError('relation_pair_invalid')
                head = _endpoint(item.get('head'), chunk, base, text)
                tail = _endpoint(item.get('tail'), chunk, base, text)
                if head['start'] == tail['start'] and head['end'] == tail['end']:
                    raise ValueError('relation_self_link_invalid')
                key = (label, head['start'], head['end'], tail['start'], tail['end'])
                candidate = {'type': label, 'head': head, 'tail': tail,
                             'identityVerified': False, 'scientificEvidence': False,
                             'canonicalWriteAuthorized': False, 'rankingAuthorized': False}
                if key not in seen or min(head['confidence'], tail['confidence']) > min(
                        seen[key]['head']['confidence'], seen[key]['tail']['confidence']):
                    seen[key] = candidate
                if len(seen) > max_relations:
                    raise ValueError('relation_document_budget_exceeded')
    out = sorted(seen.values(), key=lambda p: (p['head']['start'], p['tail']['start'], p['type']))
    return {'relation_candidates': out,
            'relation_extraction_status': 'local_model_executed_unverified',
            'relation_windows': windows,
            'relation_seconds_inference': round(time.perf_counter()-start, 3)}
