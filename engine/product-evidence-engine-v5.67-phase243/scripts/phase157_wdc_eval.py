#!/usr/bin/env python3
"""Reproducible offline WDC/DITTO *diagnostic*, not a PEE-model evaluation.

Reads the user-provided Ditto GitHub ZIP without extracting or redistributing WDC data.
The `model_token_overlap` rule is an intentionally weak reference baseline to
quantify false matches and abstentions before any learned model is introduced.
Labels are historical WDC product-pair annotations, not original-review gold.
"""
from __future__ import annotations
import argparse, hashlib, io, json, re, sys, zipfile
from collections import Counter

CATEGORIES = ("cameras", "computers", "shoes", "watches")
CODE = re.compile(r"(?<![A-Za-z0-9])(?=[A-Za-z0-9/-]{5,}\b)(?=[A-Za-z0-9/-]*\d)[A-Za-z0-9]+(?:[-/][A-Za-z0-9]+)*(?![A-Za-z0-9])")
FILTER = re.compile(r"^(?:\d+(?:gb|tb|mb|mp|mm|cm|inch|hz|mhz|ghz|w|v|mah|fps)|\d{4}p|\d+|\d+x\d+)$", re.I)

def codes(title: str) -> set[str]:
    tokens = set()
    for match in CODE.finditer(title):
        word = match.group().upper()
        if len(word) >= 5 and any(c.isalpha() for c in word) and any(c.isdigit() for c in word) and not FILTER.fullmatch(word):
            tokens.add(word)
    return tokens

def weak_prediction(left: str, right: str) -> str:
    # This is deliberately only a lexical baseline and MUST NOT make canonical merges.
    a, b = codes(left), codes(right)
    if not a or not b: return "abstain"
    if a & b: return "match_candidate"
    return "abstain"

def parse_row(line: str):
    # Some historic WDC lines contain literal tab characters in field content.
    # Reject them rather than making up an automatic repair of the gold labels.
    items = line.rstrip("\r\n").split("\t")
    if len(items) != 3 or items[2] not in {"0", "1"}: return None
    if not items[0].startswith("COL title VAL ") or not items[1].startswith("COL title VAL "): return None
    return items[0].removeprefix("COL title VAL "), items[1].removeprefix("COL title VAL "), int(items[2])

def evaluate(zip_path: str):
    result = {"phase":157,"dataset":"Ditto bundled WDC historical title-only test splits", "evaluation_scope":"external_pair_gold_not_complete_reviews", "baseline":"model_token_overlap_positive_only_with_abstention", "model_inference":False,"PEE_mainline_evaluated":False,"license_of_original_pair_data_unverified":True,"categories":{},"combined":{},"runtime_new_dependencies":[]}
    total = Counter()
    with zipfile.ZipFile(zip_path) as z:
        for category in CATEGORIES:
            path = f"ditto-master/data/wdc/{category}/test.txt"
            original = z.read(path)
            c = Counter()
            for line in io.StringIO(original.decode("utf-8", "replace")):
                parsed = parse_row(line)
                if parsed is None:
                    c["excluded_malformed"] += 1
                    continue
                a,b, gold = parsed
                c["parsed"] += 1
                c["positive_gold" if gold else "negative_gold"] += 1
                predicted = weak_prediction(a,b)
                if predicted == "abstain":
                    c["abstained"] += 1
                    c["abstained_positive" if gold else "abstained_negative"] += 1
                else:
                    c["proposed_matches"] += 1
                    c["tp" if gold else "fp"] += 1
            c["bytes_sha256"] = hashlib.sha256(original).hexdigest()
            result["categories"][category]=dict(c)
            total.update({k:v for k,v in c.items() if isinstance(v,int)})
    evaluated = total['parsed']
    result["combined"]={**dict(total),"candidate_precision":(total['tp']/(total['tp']+total['fp']) if total['tp']+total['fp'] else None),"positive_label_coverage":(total['tp']/total['positive_gold'] if total['positive_gold'] else None),"prediction_coverage":(total['proposed_matches']/evaluated if evaluated else None)}
    return result

if __name__ == '__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--ditto-zip',required=True)
    p.add_argument('--output')
    args=p.parse_args()
    out=json.dumps(evaluate(args.ditto_zip),indent=2,sort_keys=True)
    if args.output:
        with open(args.output,'w',encoding='utf-8') as f:f.write(out+'\n')
    else: print(out)
