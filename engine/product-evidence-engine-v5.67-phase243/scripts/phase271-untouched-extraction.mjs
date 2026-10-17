#!/usr/bin/env node
/** Phase271 held-out extraction AND attribution evaluation (owner directive 2026-10-17 §5-§6), on the Phase271 documents
 * (private-eval/phase271, gold annotated before any run). Same operational path as Phase270 (test leads, comparative
 * results, qualitative observations); additionally scores the SUBJECT of every matched lead and observation:
 * correct, incorrect exact match (a named or exact subject that is the wrong product), or unresolved (no product).
 * Full run (values) private; value-free summary public. Never overwrites. Usage: node scripts/phase271-untouched-extraction.mjs LABEL
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {homedir} from 'node:os';import {join} from 'node:path';
import {extractSpecifications245} from '../dist/src/phase245_spec_extraction.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../dist/src/phase265_test_measurements.js';
import {qualitativeObservations269} from '../dist/src/phase269_qualitative_observations.js';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval/phase271');
const PRIV=join(P,`untouched-extraction-${label}.json`),PUB=`evaluation/phase271/untouched-extraction-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: runs are never overwritten');
const gp=join(P,'untouched-extraction-gold.json');const G=JSON.parse(readFileSync(gp,'utf8'));const goldSha=createHash('sha256').update(readFileSync(gp)).digest('hex');
const S=JSON.parse(readFileSync(join(P,'wave.json'),'utf8'));const sha=b=>createHash('sha256').update(b).digest('hex');
// Fixed scoring vocabulary (before the first run).
const UNIT={dB:['db','dba'],seconds:['seconds','s'],minutes:['minutes']};
const DISH={cakes:['cakes','apple_pie'],cookies:['cookies'],burgers:['burgers'],fish:['fish'],general:['general']};
const dishOk=(g,o)=>(DISH[g]??[g]).includes(o);
const GENERIC=new Set(['air','fryer','fryers','the','a','and','with','countertop','smart','in','1','review']);
const core=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9.\- ]+/g,' ').split(/\s+/).filter(t=>t&&!GENERIC.has(t)));
const sameProduct=(a,b)=>{const x=core(a),y=core(b);if(!x.size||!y.size)return false;let i=0;for(const t of x)if(y.has(t))i++;return i/(x.size+y.size-i)>=0.6;};
const subjectOutcome=(gold,s)=>!s?'unresolved':sameProduct(gold,s)?'correct':'incorrect_match';
const out=[];const T={q:{gold:0,leads:0,matched:0,correct:0,incorrect:0,unresolved:0},o:{gold:0,extracted:0,matched:0,correct:0,incorrect:0,unresolved:0}};
for(const tag of G.documents){
 const p=S.pages.find(x=>x.tag===tag);const b=readFileSync(join(P,'raw',tag+'.html'));if(sha(b)!==p.sha256)throw Error('receipt '+tag);
 const html=b.toString('utf8'),url=p.finalUrl??p.url;const x=testDocumentSubject268(extractSpecifications245(html,url),p.sourceType);
 const tl=testLeadsFromHtml265(html,url,p.sha256,x,{category:p.category});
 const page=x.mainProduct?.name??null;
 const leads=[...tl.probe.candidates.map(c=>({value:c.value,unit:String(c.unit).toLowerCase(),subject:c.subject?.name??null})),...(tl.comparative270??[]).map(c=>({value:c.value,unit:c.unit,subject:c.subject?.name??null}))];
 const gq=G.quantitative.filter(g=>g.doc===tag);const used=new Set();const qm=[];
 for(const g of gq){const i=leads.findIndex((l,k)=>!used.has(k)&&Math.abs(l.value-g.value)<1e-9&&(UNIT[g.unit]??[g.unit.toLowerCase()]).includes(l.unit));if(i<0)continue;used.add(i);qm.push({g,l:leads[i],subject:subjectOutcome(g.subject,leads[i].subject)});}
 const {observations}=qualitativeObservations269(html);
 // An observation's subject is its own (when the reader attributes one) or the page's product.
 const obs=observations.map(o=>({...o,subjectName:o.subject?.name??(o.appliance&&o.appliance!=='air_fryer'?null:page)}));
 const go=G.qualitative.filter(g=>g.doc===tag);const ou=new Set();const om=[];
 for(const g of go){const i=obs.findIndex((o,k)=>!ou.has(k)&&dishOk(g.dish,o.dish)&&o.outcome===g.outcome&&o.direction===g.direction&&sameProduct(g.subject,o.subjectName));
  const j=i>=0?i:obs.findIndex((o,k)=>!ou.has(k)&&dishOk(g.dish,o.dish)&&o.outcome===g.outcome&&o.direction===g.direction);
  if(j<0)continue;ou.add(j);om.push({g,o:{dish:obs[j].dish,outcome:obs[j].outcome,direction:obs[j].direction,subject:obs[j].subjectName},subject:subjectOutcome(g.subject,obs[j].subjectName)});}
 const add=(t,m)=>{t.matched+=m.length;for(const x of m)t[x.subject==='correct'?'correct':x.subject==='unresolved'?'unresolved':'incorrect']++;};
 T.q.gold+=gq.length;T.q.leads+=leads.length;add(T.q,qm);T.o.gold+=go.length;T.o.extracted+=obs.length;add(T.o,om);
 out.push({tag,quantitative:{gold:gq.length,leads:leads.length,matched:qm,extra:leads.filter((l,k)=>!used.has(k))},qualitative:{gold:go.length,extracted:obs.length,matched:om,extra:obs.filter((o,k)=>!ou.has(k)).map(o=>({dish:o.dish,outcome:o.outcome,direction:o.direction,subject:o.subjectName}))}});
}
const r=(a,b)=>b?Math.round(1000*a/b)/1000:null;
const summary={quantitative:{...T.q,precision:r(T.q.matched,T.q.leads),recall:r(T.q.matched,T.q.gold)},
 qualitative:{...T.o,precision:r(T.o.matched,T.o.extracted),recall:r(T.o.matched,T.o.gold),subjectCorrectOfMatched:r(T.o.correct,T.o.matched),incorrectExactOfMatched:r(T.o.incorrect,T.o.matched)}};
const meta={label,at:new Date().toISOString(),goldSha256:goldSha};
writeFileSync(PRIV,JSON.stringify({schema:'pee271.untouched-extraction-run.v1',...meta,summary,docs:out},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({schema:'pee271.untouched-extraction-run-public.v1',...meta,summary,documents:out.map(d=>({tag:d.tag,
 quantitative:{gold:d.quantitative.gold,leads:d.quantitative.leads,matched:d.quantitative.matched.length,subjects:d.quantitative.matched.map(m=>m.subject)},
 qualitative:{gold:d.qualitative.gold,extracted:d.qualitative.extracted,matched:d.qualitative.matched.length,subjects:d.qualitative.matched.map(m=>m.subject),falsePositives:d.qualitative.extra.map(e=>({dish:e.dish,outcome:e.outcome,direction:e.direction}))}}))},null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
