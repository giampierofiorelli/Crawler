"""R3 cycle 3 (owner S76): bounded, shadow-only feasibility experiment with a small local semantic model as a
validator of concept alignments. Not part of PEE: no PEE module imports this, nothing it produces enters the store,
links or rankings. Weights are downloaded to a cache outside the repositories (HF_HOME) and never committed.

  <venv>/bin/python scripts/r3-semantic/validate.py METHOD SIDE OUT_JSON
    METHOD: nli (cross-encoder/nli-deberta-v3-xsmall) | llm (Qwen/Qwen2.5-1.5B-Instruct) | llm05 (Qwen/Qwen2.5-0.5B-Instruct)
    SIDE:   dev | heldout | transfer   (reads $PEE_PRIVATE_EVAL_DIR/r3/align/SIDE/in.json; never reads the annotation)

For every candidate of every mention it writes scores only (no decision): NLI entailment probabilities in both
directions, or LLM label probabilities over the SKOS match types. Decisions and thresholds live in the scorer.
"""
import json, os, sys, time, resource
from pathlib import Path
method, side, out = sys.argv[1], sys.argv[2], sys.argv[3]
PE = Path(os.environ.get('PEE_PRIVATE_EVAL_DIR', Path.home() / '.local/share/product-evidence-engine/private-eval')) / 'r3/align'
mentions = json.loads((PE / side / 'in.json').read_text())['mentions']
import torch
torch.set_num_threads(4)
t0 = time.time()
def label(cid): return cid.replace('_', ' ')
def short(d, n=220): return ' '.join(d.split())[:n]
rows = []
if method == 'nli':
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    name = 'cross-encoder/nli-deberta-v3-xsmall'
    tok = AutoTokenizer.from_pretrained(name); model = AutoModelForSequenceClassification.from_pretrained(name).eval()
    labels = {v.lower(): int(k) for k, v in model.config.id2label.items()}
    ent = labels['entailment']; con = labels['contradiction']
    load = time.time() - t0
    def nli(p, h):
        with torch.no_grad():
            x = tok(p, h, return_tensors='pt', truncation=True, max_length=256)
            pr = torch.softmax(model(**x).logits[0], -1)
        return float(pr[ent]), float(pr[con])
    for m in mentions:
        V = os.environ.get('NLI_VARIANT', 'a')
        ctx = f'In the sentence "{short(m["quote"], 300)}", the phrase "{m["text"]}" is used.'
        for c in m['candidates']:
            if V == 'a':   # shared context in both (first design; the shared prefix inflates entailment)
                a = f'{ctx} It refers to {m["text"]}.'; b = f'{ctx} It refers to {label(c["concept"])}: {short(c["description"])}'
            elif V == 'c': # the phrase and the concept description, no context (bidirectional entailment of the two descriptions)
                a = f'{m["text"]}.'; b = f'{label(c["concept"])}: {short(c["description"])}'
            else:          # d: the sentence, and the claim that its phrase refers to the concept (one direction; reverse = concept -> phrase)
                a = short(m['quote'], 400); b = f'"{m["text"]}" means {label(c["concept"])}.'
            e1, c1 = nli(a, b); e2, c2 = nli(b, a)
            rows.append({'mention': m['mention'], 'concept': c['concept'], 'e_m2c': e1, 'e_c2m': e2, 'c_m2c': c1, 'c_c2m': c2})
else:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    name = 'Qwen/Qwen2.5-1.5B-Instruct' if method == 'llm' else 'Qwen/Qwen2.5-0.5B-Instruct'
    tok = AutoTokenizer.from_pretrained(name); model = AutoModelForCausalLM.from_pretrained(name, torch_dtype=torch.bfloat16).eval()
    load = time.time() - t0
    opts = ['exact', 'close', 'broader', 'narrower', 'related', 'none']
    first = [tok.encode(' ' + o, add_special_tokens=False)[0] for o in opts]
    first2 = [tok.encode(o, add_special_tokens=False)[0] for o in opts]
    sysmsg = ('You align phrases from scientific teaching documents about household appliances to taught concepts. '
              'Answer with one word: exact (same concept), close (nearly the same, interchangeable here), broader (the concept is more general '
              'than what the phrase refers to), narrower (the concept is more specific), related (associated but not the same thing), '
              'none (unrelated or only sharing words). Shared words are not evidence of identity.')
    for m in mentions:
        for c in m['candidates']:
            user = (f'Sentence: "{short(m["quote"], 400)}"\nPhrase: "{m["text"]}"\n'
                    f'Concept: {label(c["concept"])} ({c["kind"]}): {short(c["description"], 300)}\n'
                    'How does the concept relate to what the phrase refers to in this sentence? One word.')
            msgs = [{'role': 'system', 'content': sysmsg}, {'role': 'user', 'content': user}]
            ids = tok.apply_chat_template(msgs, add_generation_prompt=True, return_tensors='pt')
            with torch.no_grad():
                lp = torch.log_softmax(model(ids).logits[0, -1].float(), -1)
            p = {o: float(torch.logsumexp(torch.stack([lp[first[i]], lp[first2[i]]]), 0)) for i, o in enumerate(opts)}
            z = torch.logsumexp(torch.tensor(list(p.values())), 0).item()
            rows.append({'mention': m['mention'], 'concept': c['concept'], 'p': {k: float(torch.exp(torch.tensor(v - z))) for k, v in p.items()}})
elapsed = time.time() - t0
cost = {'model': name, 'load_seconds': round(load, 1), 'total_seconds': round(elapsed, 1), 'pairs': len(rows),
        'seconds_per_pair': round((elapsed - load) / max(1, len(rows)), 3), 'max_rss_mb': round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024),
        'threads': torch.get_num_threads(), 'device': 'cpu'}
Path(out).write_text(json.dumps({'method': method, 'side': side, 'cost': cost, 'rows': rows}, indent=1) + '\n')
print(json.dumps(cost))
