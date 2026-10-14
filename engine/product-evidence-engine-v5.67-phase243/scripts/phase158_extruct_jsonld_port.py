#!/usr/bin/env python3
"""Small, explicitly licensed adaptation of extruct's JSON-LD extractor.

Original: extruct/jsonld.py and extruct/utils.py, Scrapinghub, BSD-3-Clause.
Full notice: licences/phase158_upstream/extruct-master-LICENSE
Only STANDARD JSON-LD is interpreted here; unlike full extruct it does not repair
malformed JavaScript/JSON, parse Microdata, RDFa, or other embedded formats.
Run on a caller-supplied, authorized local HTML file. No crawling or network.
"""
import argparse, hashlib, json, pathlib, sys
from lxml import html

def jsonld(html_content):
    if len(html_content)>2_000_000:raise ValueError('html_size_budget_exceeded')
    document=html.fromstring(html_content)
    scripts=document.xpath('descendant-or-self::script[translate(@type,"ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="application/ld+json"]')
    if len(scripts)>64:raise ValueError('script_count_budget_exceeded')
    entities=[];errors=[]
    for i,node in enumerate(scripts):
        raw=(node.text_content() or '').strip()
        if not raw:continue
        if len(raw)>300_000:errors.append(f'script_{i}:budget_exceeded');continue
        try:
            data=json.loads(raw)
        except (ValueError,TypeError):
            errors.append(f'script_{i}:invalid_jsonld_no_heuristic_repair')
            continue
        if isinstance(data,dict):entities.append(data)
        elif isinstance(data,list):entities.extend(d for d in data[:150] if isinstance(d,dict))
        else:errors.append(f'script_{i}:non_object_jsonld')
    return {'json-ld':entities[:200],'microdata':[], 'errors':errors,
        'extructFullLibraryExecuted':False,'adaptedFromExtructJsonLdExtractor':True,
        'truncated':len(entities)>200}

def run(html_file):
    content=pathlib.Path(html_file).read_bytes()
    if len(content)>2_000_000:raise ValueError('html_size_budget_exceeded')
    result=jsonld(content)
    result['htmlSha256']=hashlib.sha256(content).hexdigest()
    result['sourcePath']=str(pathlib.Path(html_file).resolve())
    return result
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--html-file',required=True);p.add_argument('--output')
    args=p.parse_args()
    result=json.dumps(run(args.html_file),indent=2,ensure_ascii=False)
    if args.output:pathlib.Path(args.output).write_text(result+'\n')
    else:print(result)
