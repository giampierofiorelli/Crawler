#!/usr/bin/env node
/** S81 census on real readings (development: the S80 pages are spent, never validation). Reads each retained S80 page
 * with the newer whole-document reader (WD + 1G tables + QK), links the typed values to the store's teaching, and
 * compares, on the SAME values, the pre-S81 reasoning (link-rules v6, store verdicts, QK-only comparability) with the
 * S81 reasoning (link-rules v8: condition concepts, comparability under the teaching).
 * Public output: counts only (no values, no page text). Private output (--private): per-value detail.
 * Usage: node scripts/s81-real-census.mjs --out evaluation/s81/real-census-<label>.json --private <private-file> */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out'),PRIV=arg('private');for(const f of [OUT,PRIV])if(f&&existsSync(f))throw Error(f+' exists: never overwritten');
const D=join(process.cwd(),'dist/src/');const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const QK=await import(D+'quantity_knowledge.js');const WD=await import(D+'document_evidence.js');const KL=await import(D+'knowledge_link.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const qk=QK.loadQuantityKnowledge();const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const V6=JSON.parse(readFileSync('resources/quantity-knowledge/link-rules.v6.json','utf8'));
const W=JSON.parse(readFileSync(join(PE,'s80/wave.json'),'utf8'));
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const priv=[];
const STRONG=new Set(['direct','partial']);
for(const p of W.pages){const html=readFileSync(join(PE,'s80/raw',p.tag+'.html'),'utf8');const cat=p.category;
 const doc=WD.readDocumentEvidence(html,qk,{sourceType:'independent_review'});
 const vals=[...doc.quantities.filter(q=>!q.identifierPart&&q.quantity).map(q=>({quantity:q.quantity,product:q.product})),
  ...doc.tables.tables.flatMap(tb=>tb.observations.filter(o=>o.quantity).map(o=>({quantity:o.quantity,product:o.product})))].map((x,i)=>({id:p.tag+'#'+i,product:x.product??null,quantity:x.quantity,source:p.tag}));
 inc('values',vals.length);inc('cat:'+cat+':values',vals.length);
 const k=KL.categoryKnowledge(store,cat,{qk});
 const before=KL.linkValues(qk,KL.teachingView(store,cat),vals,{rules:V6,descriptors:k.descriptors});
 const after=KL.evidenceUnderKnowledge(qk,k,vals.map(v=>({...v,measurement:null})));
 const lv=new Map(before.results.map(r=>[r.value,r]));
 const aft=new Map();for(const r of after.results)(aft.get(r.value)??aft.set(r.value,[]).get(r.value)).push(r);
 for(const v of vals){const b=lv.get(v.id);const linked=['linked','linked_condition_not_shown','linked_equivalent'].includes(b.status);
  if(linked)inc('linked');if(b.status==='ambiguous')inc('ambiguous');
  // the connection from the reader's record to the conditions the teaching requires (per linked value and measurement)
  if(linked)for(const m of b.measurements){const tm=k.view.measurements.find(x=>x.concept.id===m);
   for(const c of (tm?.conditions??[]).map(c=>KL.conditionConcept(qk,c))){inc('req');
    const axisShown=c.axes.length&&c.axes.every(a=>v.quantity.conditions.some(x=>x.axis===a));
    inc(c.identity?'req:identity':!c.axes.length?'req:untyped':axisShown?'req:typed_shown':'req:typed_not_stated');}}
  const bs=b.evidence.map(e=>e.force),as=(aft.get(v.id)??[]).map(e=>e.force);
  for(const f of bs)inc('before:'+f);for(const f of as)inc('after:'+(f==='not_verified'?'unverified':f));
  const bStrong=bs.some(f=>STRONG.has(f)),aStrong=as.some(f=>STRONG.has(f));
  if(bStrong&&!aStrong){inc('strong_withdrawn');const miss=after.conditionsNotShown.filter(c=>c.value===v.id).map(c=>c.condition);for(const c of miss)inc('withdrawn_by:'+c);
   priv.push({tag:p.tag,value:v.id,surface:v.quantity.surface,product:v.product,measurements:b.measurements,before:bs,after:as,notShown:miss,axes:v.quantity.conditions.map(c=>c.axis+'='+c.value)});}
  if(!bStrong&&aStrong)inc('strong_added');}
 // pairwise comparability of different products' values linked to one measurement
 const byM=new Map();for(const r of before.results)if(r.status==='linked'||r.status==='linked_condition_not_shown')for(const m of r.measurements)(byM.get(m)??byM.set(m,[]).get(m)).push(vals.find(x=>x.id===r.value));
 for(const [m,xs] of byM)for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){const a=xs[i],b=xs[j];if(!a.product||!b.product||a.product===b.product)continue;
  const q=QK.compareQuantities(qk,a.quantity,b.quantity);const qv=q.verdict==='comparable'||q.verdict==='comparable_within_source'?'comparable':q.verdict==='not_comparable'?'not_comparable':'unestablished';
  const kv=KL.compareUnderKnowledge(qk,k,m,a,b);inc('pairs');inc('pairs_before:'+qv);inc('pairs_after:'+kv.verdict);
  if(qv==='comparable'&&kv.verdict!=='comparable'){inc('pairs_comparable_withdrawn');for(const c of kv.conditions.filter(c=>c.state!=='equal'))inc('pair_withdrawn_by:'+c.condition+':'+c.state);}
  if(qv!=='comparable'&&kv.verdict==='comparable')inc('pairs_comparable_added');}
}
// declared attributes in the store that the teaching's attribute limits cover (real declarations, all categories)
const norm=s=>String(s??'').toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
for(const cat of ['air_fryers','air_purifiers','coffee_machines','dehumidifiers','dishwashers','televisions']){const k=KL.categoryKnowledge(store,cat,{qk});const lim=new Set(k.attributeLimits.map(a=>a.attribute));
 const rows=store.db.prepare(`SELECT rp.property_label AS label, rp.product_id AS pid FROM revision_properties rp JOIN products p ON p.product_id=rp.product_id WHERE p.category_hypotheses_json LIKE ?`).all('%"'+cat+'"%');
 inc('decl:'+cat+':labels',rows.length);const hit=rows.filter(r=>lim.has(norm(r.label)));inc('decl:'+cat+':covered',hit.length);
 inc('decl:'+cat+':covered_products',new Set(hit.map(r=>r.pid)).size);inc('decl:'+cat+':limits',lim.size);}
const out={schema:'pee.s81.real-census.v1',tier:'T2 authentic controlled (S80 pages: spent, development only; no gold for evidence force)',
 rulesBefore:'link-rules v6 + store verdicts + QK compare',rulesAfter:'link-rules v8 (kr81.2)',pages:W.pages.length,totals:Object.fromEntries(Object.entries(T).sort())};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(PRIV)writeFileSync(PRIV,JSON.stringify({...out,withdrawn:priv},null,1)+'\n');
console.log(JSON.stringify(out.totals,null,0));
