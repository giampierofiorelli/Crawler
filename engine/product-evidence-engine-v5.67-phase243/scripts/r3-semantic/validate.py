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
mentions = json.loads((PE / side / 'in.json').read_text())['mentions'][:int(os.environ.get('LIMIT', '100000'))]
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
    tok = AutoTokenizer.from_pretrained(name); model = AutoModelForCausalLM.from_pretrained(name, dtype=torch.float32).eval()
    load = time.time() - t0
    opts = ['exact', 'close', 'broader', 'narrower', 'related', 'none']
    # audit S77 (A4-1): the first design read only the first token of the lowercase forms, so "narrower" was the token "n"
    # and capitalised answers ("Exact", the likely form at the start of a reply) were discarded. LLM_READOUT=seq (default)
    # scores every surface form (lower/capitalised, with/without a leading space) by its full token-sequence probability.
    import copy
    READOUT = os.environ.get('LLM_READOUT', 'seq')
    forms = {o: [tok.encode(v, add_special_tokens=False) for v in (o, ' ' + o, o.capitalize(), ' ' + o.capitalize())] for o in opts}
    first = [tok.encode(' ' + o, add_special_tokens=False)[0] for o in opts]
    first2 = [tok.encode(o, add_special_tokens=False)[0] for o in opts]
    sysmsg = ('You align phrases from scientific teaching documents about household appliances to taught concepts. '
              'Answer with one word: exact (same concept), close (nearly the same, interchangeable here), broader (the concept is more general '
              'than what the phrase refers to), narrower (the concept is more specific), related (associated but not the same thing), '
              'none (unrelated or only sharing words). Shared words are not evidence of identity.')
    # S94 Stage 3: LLM_INPUT=structured adds PEE's structured scientific information (structured.json, built by
    # scripts/s94-align.mjs structured SIDE): the phrase's semantic type and quantity typing, the concept's kind, quantity
    # typing and graph relations, the lexical anchor and the distributional relatedness. Default: the S76 input, unchanged.
    INPUT = os.environ.get('LLM_INPUT', 's76')
    ST = json.loads((PE / side / 'structured.json').read_text())['mentions'] if INPUT == 'structured' else {}
    for m in mentions:
        for c in m['candidates']:
            user = (f'Sentence: "{short(m["quote"], 400)}"\nPhrase: "{m["text"]}"\n'
                    f'Concept: {label(c["concept"])} ({c["kind"]}): {short(c["description"], 300)}\n')
            if INPUT == 'structured':
                sm = ST[m['mention']]; sc = sm['candidates'][c['concept']]
                user += (f'Phrase analysis: refers to a {sm["denotes"].replace("_", " ")}; quantity kinds: {", ".join(sm["kinds"]) or "none"}; metrics: {", ".join(sm["metrics"]) or "none"}.\n'
                         f'Concept analysis: quantity kinds: {", ".join(sc["kinds"]) or "none"}; metrics: {", ".join(sc["metrics"]) or "none"}; '
                         f'graph relations: {"; ".join(sc["relations"]) or "none"}.\n'
                         f'Checks: concept kind {"compatible" if sc["denotationCompatible"] else "not compatible"} with what the phrase refers to; '
                         f'quantity typing {sc["quantity"]}; lexical anchor {sc["anchor"] or "none"}; name coverage {sc["coverage"]}; '
                         f'distributional relatedness {sc["similarity"]} (relatedness is not identity).\n')
            user += 'How does the concept relate to what the phrase refers to in this sentence? One word.'
            msgs = [{'role': 'system', 'content': sysmsg}, {'role': 'user', 'content': user}]
            enc = tok.apply_chat_template(msgs, add_generation_prompt=True, return_tensors='pt', return_dict=True)
            with torch.no_grad():
                out0 = model(**enc, use_cache=True)
                lp = torch.log_softmax(out0.logits[0, -1].float(), -1)
                if READOUT == 'first':
                    p = {o: float(torch.logsumexp(torch.stack([lp[first[i]], lp[first2[i]]]), 0)) for i, o in enumerate(opts)}
                else:
                    p = {}
                    for o in opts:
                        seqs = []
                        for ids in forms[o]:
                            s_ = float(lp[ids[0]])
                            if len(ids) > 1:
                                cache = copy.deepcopy(out0.past_key_values)
                                x = torch.tensor([ids[:-1]]); am = torch.ones(1, enc['input_ids'].shape[1] + len(ids) - 1, dtype=torch.long)
                                l2 = torch.log_softmax(model(input_ids=x, attention_mask=am, past_key_values=cache, use_cache=True).logits[0].float(), -1)
                                s_ += sum(float(l2[j, ids[j + 1]]) for j in range(len(ids) - 1))
                            seqs.append(s_)
                        p[o] = float(torch.logsumexp(torch.tensor(seqs), 0))
            mass = float(torch.exp(torch.logsumexp(torch.tensor(list(p.values())), 0)))
            z = torch.logsumexp(torch.tensor(list(p.values())), 0).item()
            rows.append({'mention': m['mention'], 'concept': c['concept'], 'p': {k: float(torch.exp(torch.tensor(v - z))) for k, v in p.items()}, 'label_mass': mass})
elapsed = time.time() - t0
cost = {'model': name, 'load_seconds': round(load, 1), 'total_seconds': round(elapsed, 1), 'pairs': len(rows),
        'seconds_per_pair': round((elapsed - load) / max(1, len(rows)), 3), 'max_rss_mb': round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024),
        'threads': torch.get_num_threads(), 'device': 'cpu'}
Path(out).write_text(json.dumps({'method': method, 'side': side, 'input': os.environ.get('LLM_INPUT', 's76'), 'readout': os.environ.get('LLM_READOUT', 'seq') if method != 'nli' else None, 'nli_variant': os.environ.get('NLI_VARIANT', 'a') if method == 'nli' else None, 'cost': cost, 'rows': rows}, indent=1) + '\n')
print(json.dumps(cost))
