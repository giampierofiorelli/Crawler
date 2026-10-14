"""Phase 87: offline deterministic extraction of manufacturer HTML specifications.

This module has no networking and must only receive transient HTML from the existing
Phase 69 readApprovedSource authorization boundary. No output is ranked/published.
Uses only the Python standard library, not a crawling framework or commercial API.
"""
from __future__ import annotations

import hashlib
import json
import re
import sqlite3
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urlsplit

MAX_HTML = 750_000
MAX_NODES = 35_000
MAX_DEPTH = 90
MAX_CANDIDATES = 250
MAX_FIELDS = 32
MAX_SAMPLES = 6
MAX_LABEL = 64
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
SKIP = {'script','style','noscript','template','svg','nav','footer','header','form','button'}
SINGLE = {'p','li','dt','dd','tr','th','td'}
LABEL = re.compile(r"^[\wÀ-ÿ][\wÀ-ÿ .()/%+\-°]{0,63}$", re.UNICODE)
NUMERIC = re.compile(r"^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*([\w°/%-]{1,14})$", re.UNICODE)
UNIT_ALIASES = {
    'h':'h','hr':'h','hrs':'h','hour':'h','hours':'h',
    'min':'min','mins':'min','minute':'min','minutes':'min',
    'kg':'kg','g':'g','mm':'mm','cm':'cm','m':'m',
    'l':'L','litre':'L','litres':'L','liter':'L','liters':'L',
    'ml':'mL','w':'W','kw':'kW','kwh':'kWh','db':'dB','hz':'Hz',
    'mah':'mAh','wh':'Wh','gb':'GB','tb':'TB','°c':'°C','c':'°C',
    'in':'in','inch':'in','inches':'in', '%':'%'
}

class Reject(ValueError):
    """Fail closed on unsupported/ambiguous evidence."""

class Node:
    __slots__ = ('tag','attrs','children','parts','parent')
    def __init__(self, tag: str, attrs=None, parent=None):
        self.tag=tag
        self.attrs=dict(attrs or [])
        self.children=[]
        self.parts=[]
        self.parent=parent

class BoundedHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root=Node('root')
        self.stack=[self.root]
        self.count=0
    def handle_starttag(self,tag,attrs):
        if self.count>=MAX_NODES: raise Reject('html_node_limit')
        if tag in SINGLE:
            # Recover simple optional end tags of common manufacturer markup.
            auto = {'tr':{'tr','td','th'},'td':{'td','th'},'th':{'td','th'},
                    'dt':{'dt','dd'},'dd':{'dt','dd'},'p':{'p'},'li':{'li'}}.get(tag,set())
            while len(self.stack)>1 and self.stack[-1].tag in auto:
                self.stack.pop()
        if len(self.stack)>=MAX_DEPTH: raise Reject('html_depth_limit')
        node=Node(tag,attrs,self.stack[-1])
        self.stack[-1].children.append(node)
        self.stack[-1].parts.append(node)
        self.count+=1
        if tag not in VOID: self.stack.append(node)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:
                del self.stack[i:]
                return
    def handle_data(self,data):
        if data and all(n.tag not in SKIP for n in self.stack):
            self.stack[-1].parts.append(data)
    def handle_entityref(self,name):
        self.handle_data('&'+name+';')

def _nodes(root):
    stack=[root]
    while stack:
        n=stack.pop()
        if n.tag in SKIP: continue
        yield n
        stack.extend(reversed(n.children))

def _text(node):
    pieces=[]
    stack=[node]
    while stack:
        n=stack.pop()
        if isinstance(n,str):pieces.append(n);continue
        if n.tag in SKIP:continue
        stack.extend(reversed(n.parts))
    return re.sub(r'\s+', ' ', ''.join(pieces)).strip()

def _clean_label(value):
    if not isinstance(value,str): return None
    value=re.sub(r'\s+',' ',value).strip(' :')
    if not 2<=len(value)<=MAX_LABEL or not LABEL.fullmatch(value): return None
    # Avoid passing obvious instruction-like website text to the local model.
    if re.search(r'\b(?:ignore|system|developer|assistant|prompt|instruction|execute|tool|output)\b',value,re.I):return None
    return value

def _spec_value(raw):
    raw=re.sub(r'\s+',' ',raw).strip()
    if len(raw)>36: return None
    m=NUMERIC.fullmatch(raw)
    if not m: return None
    key=m.group(2).lower()
    unit=UNIT_ALIASES.get(key)
    if not unit: return None
    val=float(m.group(1))
    if not (-1_000_000_000<=val<=1_000_000_000):return None
    if val<0 and unit not in ('°C','dB'):return None
    return val,unit

def _digest(x):
    return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()

def _identity(s):
    return re.sub(r'\s+',' ',s).strip().casefold()

def _source_scope(url,host,prefix):
    try:
        p=urlsplit(url)
        invalid_port=p.port
    except ValueError as e:raise Reject('invalid_source_url') from e
    if p.scheme!='https' or not p.hostname or p.username or p.password or invalid_port or p.fragment:
        raise Reject('source_url_must_be_https')
    if not prefix.startswith('/') or any(x in prefix for x in ['..','?', '#', '\\']):
        raise Reject('invalid_scope')
    # A path-prefix scoped to /products must never accept /products-evil.
    # Prefixes ending in / match descendants; others match the exact segment
    # or descendants separated by /. Phase69 still authorizes the exact URL.
    in_scope=(p.path.startswith(prefix) if prefix.endswith('/') else
              p.path==prefix or p.path.startswith(prefix+'/'))
    if p.hostname.lower()!=host.lower() or not in_scope:
        raise Reject('source_scope_mismatch')

def parse_page(html,expected_model):
    if not isinstance(html,str) or len(html.encode('utf-8'))>MAX_HTML:
        raise Reject('html_size_limit')
    if not isinstance(expected_model,str) or not 2<=len(expected_model)<=100:
        raise Reject('invalid_product_identity')
    parser=BoundedHTML()
    try:parser.feed(html);parser.close()
    except Reject:raise
    except (ValueError,RuntimeError,RecursionError) as e:raise Reject('html_parse_failed') from e
    root=parser.root
    h1=[_text(n) for n in _nodes(root) if n.tag=='h1']
    if len(h1)!=1 or _identity(h1[0])!=_identity(expected_model):
        raise Reject('model_identity_not_unique_or_exact')
    candidates=[]
    def add(kind,label,raw):
        clean=_clean_label(label)
        parsed=_spec_value(raw)
        if clean is None or parsed is None:return
        val,unit=parsed
        cid=_digest({'kind':kind,'label':clean.casefold(),'unit':unit})[:20]
        candidates.append({'id':cid,'kind':kind,'label':clean,'unit':unit,'value':val})
        if len(candidates)>MAX_CANDIDATES:raise Reject('candidate_limit')
    for node in _nodes(root):
        if node.tag=='tr':
            cells=[n for n in node.children if n.tag in ('td','th')]
            if len(cells)==2:
                add('table',_text(cells[0]),_text(cells[1]))
        if node.tag=='dl':
            seq=[n for n in node.children if n.tag in ('dt','dd')]
            if len(seq)%2==0:
                for a,b in zip(seq[::2],seq[1::2]):
                    if a.tag=='dt' and b.tag=='dd':add('definition',_text(a),_text(b))
        if node.tag in ('p','li'):
            # Only short isolated key:value text; exclude article paragraphs.
            s=_text(node)
            if len(s)<=110 and ':' in s:
                label,raw=s.split(':',1)
                add('labelled_text',label,raw)
        if node.tag in ('div','section'):
            # Common specification cards: <div class="specs"><span>...</span><span>...</span></div>
            klass=str(node.attrs.get('class',''))[:120]
            if re.search(r'\b(?:specs?|specification|technical|detail|attribute)(?:s|[-_\w]*)\b',klass,re.I):
                c=[n for n in node.children if n.tag in ('span','p','div','strong')]
                if len(c)==2:add('spec_card',_text(c[0]),_text(c[1]))
    return candidates

def _validate_samples(samples,host,prefix):
    if not isinstance(samples,list) or not 2<=len(samples)<=MAX_SAMPLES:raise Reject('needs_2_to_6_samples')
    identities=set();urls=set();out=[]
    for s in samples:
        if not isinstance(s,dict):raise Reject('invalid_sample')
        url=s.get('url');model=s.get('model');assessor=s.get('labelled_by')
        if not isinstance(url,str) or not isinstance(model,str):raise Reject('invalid_sample_identity')
        _source_scope(url,host,prefix)
        if model.casefold() in identities or url in urls:raise Reject('duplicate_sample')
        if not isinstance(assessor,str) or len(assessor.strip())<3:raise Reject('missing_independent_label_receipt')
        identities.add(model.casefold());urls.add(url)
        out.append(parse_page(s.get('html'),model))
    return out

def proposal_inventory(samples,host,prefix,fields):
    """Metadata-only input for local LLM. Does not include HTML, numeric values or URLs."""
    inv=_validate_samples(samples,host,prefix)
    reviewed=_validate_registry(fields)
    first={c['id']:c for c in inv[0]}
    common=set(first)
    for cs in inv[1:]:common&={c['id'] for c in cs}
    # A label occurring twice on one page is ambiguous, even if repeated values agree.
    valid=[]
    for cid in sorted(common):
        if any(sum(c['id']==cid for c in cs)!=1 for cs in inv):continue
        c=first[cid]
        valid.append({k:c[k] for k in ('id','kind','label','unit')})
    return {'schema':'phase87_html_inventory_v1','candidates':valid,
            'reviewed_fields':[{'key':f['key'],'unit':f['unit']} for f in reviewed],
            'sample_count':len(samples)}

def _validate_registry(fields):
    if not isinstance(fields,list) or not 1<=len(fields)<=MAX_FIELDS:raise Reject('invalid_field_registry')
    keys=set()
    for f in fields:
        if not isinstance(f,dict) or set(f)!={'key','unit','review_id'}:
            raise Reject('field_needs_independent_review')
        if not isinstance(f['key'],str) or not re.fullmatch(r'[a-z][a-z0-9_]{1,63}',f['key']):
            raise Reject('invalid_field_key')
        if f['key'] in keys or f['unit'] not in UNIT_ALIASES.values() or not isinstance(f['review_id'],str) or len(f['review_id'])<3:
            raise Reject('invalid_reviewed_field')
        keys.add(f['key'])
    return fields

def qualify_proposal(samples,host,prefix,category,fields,proposal):
    """Validate untrusted model associations against 2+ independently labelled pages.

    Returns a non-executable recipe awaiting separate human review.
    """
    inventory=proposal_inventory(samples,host,prefix,fields)
    if not isinstance(category,str) or not re.fullmatch(r'[a-z][a-z0-9_-]{1,50}',category):raise Reject('invalid_category')
    if not isinstance(proposal,list) or not proposal:raise Reject('empty_model_proposal')
    if len(proposal)>len(fields):raise Reject('too_many_model_mappings')
    allowed={c['id']:c for c in inventory['candidates']}
    registry={f['key']:f for f in fields}
    fieldkeys=set();candidateids=set();mappings=[]
    for p in proposal:
        if not isinstance(p,dict) or set(p)!={'fieldKey','candidateId'}:raise Reject('model_output_schema')
        key,cid=p['fieldKey'],p['candidateId']
        if key in fieldkeys or cid in candidateids:raise Reject('duplicate_mapping')
        if key not in registry or cid not in allowed:raise Reject('unreviewed_mapping')
        if registry[key]['unit']!=allowed[cid]['unit']:raise Reject('unit_mismatch')
        fieldkeys.add(key);candidateids.add(cid)
        c=allowed[cid]
        mappings.append({'field_key':key,'candidate_id':cid,'label':c['label'],
                         'kind':c['kind'],'unit':c['unit'],'field_review_id':registry[key]['review_id']})
    results=_validate_samples(samples,host,prefix)
    for s,cs in zip(samples,results):
        labels=s.get('expected')
        if not isinstance(labels,dict) or set(labels)!=fieldkeys:
            raise Reject('missing_independent_field_labels')
        for m in mappings:
            expected=labels[m['field_key']]
            if (not isinstance(expected,dict) or set(expected)!={'value','unit'}
                or type(expected['value']) not in (int,float) or expected['unit']!=m['unit']):
                raise Reject('invalid_independent_label')
            vals=[c for c in cs if c['id']==m['candidate_id']]
            if len(vals)!=1 or vals[0]['value']!=expected['value']:
                raise Reject('reference_value_mismatch')
    recipe={'schema':'phase87_html_recipe_v1','status':'ready_for_human_review',
            'source_host':host.lower(),'path_prefix':prefix,'category':category,
            'mappings':sorted(mappings,key=lambda x:x['field_key']),
            'registry_hash':_digest(sorted(fields,key=lambda x:x['key'])),
            'qualification':{'distinct_models':len(samples),
                'independent_label_receipts':sorted({s['labelled_by'] for s in samples}),
                'reference_manifest_sha256':_digest([{'url':s['url'],'model':s['model'],'expected':s['expected']} for s in samples]),
                'suggestion_sha256':_digest(proposal)}}
    recipe['recipe_sha256']=_digest(recipe)
    return recipe

def approve_recipe(recipe,reviewer,review_receipt):
    if not isinstance(recipe,dict) or recipe.get('status')!='ready_for_human_review':raise Reject('not_qualified')
    sha=recipe.get('recipe_sha256')
    if sha!=_digest({k:v for k,v in recipe.items() if k!='recipe_sha256'}):raise Reject('recipe_checksum_mismatch')
    if not isinstance(reviewer,str) or len(reviewer)<3 or reviewer in recipe['qualification']['independent_label_receipts']:
        raise Reject('independent_human_reviewer_required')
    if not isinstance(review_receipt,str) or len(review_receipt)<8:raise Reject('review_receipt_required')
    reviewed={**recipe,'status':'reviewed','human_review':{'reviewer':reviewer,'receipt':review_receipt}}
    reviewed['recipe_sha256']=_digest({k:v for k,v in reviewed.items() if k!='recipe_sha256'})
    return reviewed

def _check_reviewed(recipe):
    if not isinstance(recipe,dict) or recipe.get('schema')!='phase87_html_recipe_v1' or recipe.get('status')!='reviewed':
        raise Reject('reviewed_recipe_required')
    if recipe.get('recipe_sha256')!=_digest({k:v for k,v in recipe.items() if k!='recipe_sha256'}):
        raise Reject('recipe_integrity_failed')
    if not isinstance(recipe.get('human_review'),dict) or not recipe['human_review'].get('receipt'):
        raise Reject('review_metadata_missing')

def extract_reviewed(recipe,url,model,html):
    """No I/O; source authorization must occur before caller supplies html."""
    _check_reviewed(recipe)
    _source_scope(url,recipe['source_host'],recipe['path_prefix'])
    candidates=parse_page(html,model)
    values={}
    for m in recipe['mappings']:
        found=[c for c in candidates if c['id']==m['candidate_id'] and c['kind']==m['kind'] and c['unit']==m['unit']]
        if len(found)!=1:raise Reject('recipe_missing_or_ambiguous_field:'+m['field_key'])
        values[m['field_key']]={'value':found[0]['value'],'unit':m['unit'],
           'origin':'manufacturer_declared','evidence_state':'quarantined_not_independently_tested',
           'source_url':url,'model':model,'strategy_sha256':recipe['recipe_sha256']}
    return values

from contextlib import contextmanager

@contextmanager
def _db(path):
    con=sqlite3.connect(path,timeout=15)
    try:
        with con:
            yield con
    finally:
        con.close()

class StrategyMemory:
    """Separate experimental single-host SQLite strategy memory (not Phase85's store).

    No raw HTML or product numeric values are stored. Failures suspend recipes;
    requalification and renewed human approval must occur outside this class.
    """
    def __init__(self,path):
        self.path=str(path)
        with _db(self.path) as con:
            con.execute('''CREATE TABLE IF NOT EXISTS strategies
                (id TEXT PRIMARY KEY, recipe_json TEXT NOT NULL, active INTEGER NOT NULL,
                 failures INTEGER NOT NULL DEFAULT 0, last_outcome TEXT NOT NULL DEFAULT 'never')''')
    def install(self,recipe):
        _check_reviewed(recipe)
        ident=recipe['recipe_sha256']
        with _db(self.path) as con:
            con.execute('INSERT OR IGNORE INTO strategies (id,recipe_json,active) VALUES (?,?,1)',
                        (ident,json.dumps(recipe,sort_keys=True)))
        return ident
    def get(self,ident):
        with _db(self.path) as con:
            row=con.execute('SELECT recipe_json,active FROM strategies WHERE id=?',(ident,)).fetchone()
        if row is None or not row[1]:raise Reject('unknown_or_suspended_recipe')
        recipe=json.loads(row[0]);_check_reviewed(recipe)
        return recipe
    def extract(self,ident,url,model,html):
        recipe=self.get(ident)
        try:
            data=extract_reviewed(recipe,url,model,html)
        except Reject as e:
            # Scope/auth errors must not mutate recipe performance counters.
            if str(e).startswith('recipe_missing'):
                with _db(self.path) as con:
                    con.execute('''UPDATE strategies SET failures=failures+1,
                        active=CASE WHEN failures+1>=2 THEN 0 ELSE 1 END,
                        last_outcome=? WHERE id=?''',(str(e)[:180],ident))
            raise
        with _db(self.path) as con:
            con.execute('UPDATE strategies SET failures=0,last_outcome=? WHERE id=?',('structural_extraction_only',ident))
        return data
    def status(self,ident):
        with _db(self.path) as con:
            r=con.execute('SELECT active,failures,last_outcome FROM strategies WHERE id=?',(ident,)).fetchone()
        if r is None:raise Reject('unknown_recipe')
        return {'active':bool(r[0]),'consecutive_structural_failures':r[1],'last_outcome':r[2]}
