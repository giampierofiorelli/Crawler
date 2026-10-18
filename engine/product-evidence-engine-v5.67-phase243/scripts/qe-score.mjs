#!/usr/bin/env node
/**
 * QE qualitative-evidence scorer (2026-10-18), written before the structured qualitative model. Protocol:
 * evaluation/qualitative-qe/protocol.json; reference sealed in evaluation/qualitative-qe/freeze.json.
 *   node scripts/qe-score.mjs ARM LABEL      ARM = wd1 | qe1; PEE_QE_BUILD = engine root of the frozen build
 * Zero HTTP. Public output: counts only. Private output: ids and categories (no page text). Never overwrites.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const [arm,label]=process.argv.slice(2);if(!['wd1','qe1'].includes(arm)||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: wd1|qe1 LABEL');
const Q=process.env.PEE_QE_ROOT??join(homedir(),'.local/share/product-evidence-engine/private-eval/qualitative-qe');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const PUB=join('evaluation/qualitative-qe',`score-${label}-${arm}.json`),PRIV=join(REPO,'private-eval/qualitative-qe',`run-${label}-${arm}.json`);
for(const f of [PUB,PRIV])if(existsSync(f))throw Error(f+' exists: never overwritten');
const freeze=JSON.parse(readFileSync('evaluation/qualitative-qe/freeze.json','utf8'));
for(const g of freeze.files)if(sha(readFileSync(join(Q,'gold',g.file)))!==g.sha256)throw Error('reference changed since sealing: '+g.file);
if(sha(readFileSync(join(Q,'annot/annotation-input.json')))!==freeze.annotationInputSha256)throw Error('annotation input changed');
const input=JSON.parse(readFileSync(join(Q,'annot/annotation-input.json'),'utf8'));const wave=JSON.parse(readFileSync(join(Q,'wave.json'),'utf8'));
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const toks=s=>new Set(norm(s).split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1));
const nums=s=>(norm(s).replace(/(\d),(\d{3})/g,'$1$2').match(/\d+(?:\.\d+)?/g)??[]).map(Number);
const sameProduct=(a,b)=>{if(!a||!b)return false;const A=toks(a),B=toks(b);const mA=[...A].filter(x=>/\d/.test(x)&&/[a-z]/.test(x)),mB=[...B].filter(x=>/\d/.test(x)&&/[a-z]/.test(x));
 if(mA.length&&mB.length)return mA.some(x=>B.has(x))||mB.some(x=>A.has(x));let n=0;for(const x of A)if(B.has(x))n++;return n/Math.min(A.size,B.size)>=0.6;};
/** the rendered line sharing most words with the statement, relative to the longer of the two (the corrected WD mapping) */
const lineOf=(page,text)=>{const T=toks(text);let best=null,score=0;for(const l of page.lines){const L=toks(l.text);if(!L.size)continue;let n=0;for(const x of T)if(L.has(x))n++;const o=n/Math.max(T.size,L.size);if(o>score){score=o;best=l.n;}}return score>=0.3?best:null;};
const EVID={tested_experience:'observed_in_test',opinion_without_test:'opinion',reported_by_others:'reported_by_others',manufacturer_claim:'manufacturer_claim'};
const COND_KIND={fan_setting:'setting',programme:'setting',signal_mode:'setting',floor_type:'test_material',method:'test_procedure'};
const D=join(resolve(process.env.PEE_QE_BUILD??'.'),'dist/src');
const QK=await import(D+'/quantity_knowledge.js');const W=await import(D+'/document_evidence.js');const qk=QK.loadQuantityKnowledge();
const C={};const inc=k=>C[k]=(C[k]??0)+1;const rows=[];let ident=null;
for(const p of wave.pages){const html=readFileSync(join(Q,'raw',p.tag+'.html'),'utf8');const page=input.pages[p.tag];const gold=JSON.parse(readFileSync(join(Q,'gold',p.tag+'.json'),'utf8'));
 const r=W.readDocumentEvidence(html,qk,{sourceType:'independent_review'});ident=r.readingIdentity;const seg=new Map(r.segments.map(s=>[s.id,s]));
 const src=arm==='qe1'&&r.qualitativeEvidence?r.qualitativeEvidence:r.qualitative;
 const items=src.map(o=>{const s=seg.get(o.segment);const text=o.sentence?s.text.slice(o.sentence.start,o.sentence.end):s.text;
  return {id:o.id,line:lineOf(page,text),family:o.property?.aspect??o.aspect,product:o.product,isSubject:!!o.product&&o.product===r.pageSubject,
   statementType:o.statementType??null,evidenceType:o.evidenceType??EVID[o.basis]??null,polarity:o.polarity,hedged:o.hedged!==undefined?o.hedged:o.strength?o.strength==='hedged':null,
   conditionKinds:(o.conditions??[]).map(c=>c.kind??COND_KIND[c.axis]??'setting'),useContext:o.useContext??null,cause:o.cause??null,comparison:o.comparison??null,related:o.relatedMeasurement?.surface??null};});
 const used=new Set();
 for(const [gi,g] of gold.items.entries()){inc('ref_items');
  const cands=items.filter(x=>!used.has(x.id)&&String(x.line)===String(g.line)).sort((a,b)=>(b.family===g.propertyFamily?1:0)-(a.family===g.propertyFamily?1:0));const m=cands[0];
  const row={page:p.tag,ref:gi,reader:m?.id??null};rows.push(row);if(!m){inc('not_reached');continue;}used.add(m.id);inc('reached');
  const f=(k,v)=>{row[k]=v;inc(k+'_'+v);};
  f('family',m.family===g.propertyFamily?'correct':'wrong');
  f('product',g.product==='none_or_unclear'?(m.product?'attributed_where_reference_unclear':'justified_none'):!m.product?'missing':g.product==='page_subject'?(m.isSubject?'correct':'wrong'):sameProduct(m.product,g.product)?'correct':(m.isSubject&&sameProduct(g.product,r.pageSubject)?'correct':'wrong'));
  f('polarity',m.polarity===g.polarity?'correct':'wrong');
  f('statementType',!m.statementType?'missing':m.statementType===g.statementType?'correct':'wrong');
  f('evidenceType',!m.evidenceType?'missing':m.evidenceType===g.evidenceType?'correct':'wrong');
  f('hedged',m.hedged===null?'missing':m.hedged===!!g.hedged?'correct':'wrong');
  for(const c of g.conditions??[])inc(m.conditionKinds.includes(c.kind)?'condition_attributed':'condition_not_attributed');
  if(g.useContext)f('useContext',m.useContext?'present':'missing');else if(m.useContext)inc('useContext_extra');
  if(g.cause?.claim)f('cause',!m.cause?'missing':m.cause.status===g.cause.status?'correct':'status_wrong');else if(m.cause)inc('cause_extra');
  if(g.comparison?.other)f('comparison',!m.comparison?'missing':(!m.comparison.other||sameProduct(m.comparison.other,g.comparison.other))&&m.comparison.better===g.comparison.better?'correct':'wrong');
  if(g.relatedMeasurement)f('related',!m.related?'missing':nums(m.related).some(n=>nums(g.relatedMeasurement).includes(n))?'correct':'wrong');}
 for(const x of items)if(!used.has(x.id))inc('reader_not_in_reference');}
const meta={protocol:'evaluation/qualitative-qe/protocol.json',arm,label,build:process.env.PEE_QE_BUILD_COMMIT??'working tree',readingIdentity:ident,generatedAt:new Date().toISOString(),tier:'development pages, qualitative content not inspected by the developer; first run unless labelled tuned'};
mkdirSync('evaluation/qualitative-qe',{recursive:true});mkdirSync(join(REPO,'private-eval/qualitative-qe'),{recursive:true});
writeFileSync(PUB,JSON.stringify({...meta,counts:C},null,1)+'\n');writeFileSync(PRIV,JSON.stringify({...meta,counts:C,rows},null,1)+'\n');console.log(JSON.stringify(C));console.log('wrote',PUB);
