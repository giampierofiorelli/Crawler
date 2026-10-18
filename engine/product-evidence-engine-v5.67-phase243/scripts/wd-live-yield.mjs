#!/usr/bin/env node
// WD-A: what the LIVE readers keep from each retained development page (counts only; zero HTTP; no store write).
import {readFileSync,readdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {resolve} from 'node:path';const D=resolve('dist/src');
const S=await import(D+'/phase245_spec_extraction.js');const T=await import(D+'/phase265_test_measurements.js');const C7=await import(D+'/phase270_comparative_results.js');const Q9=await import(D+'/phase269_qualitative_observations.js');
const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');const seen=new Set();const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;
for(const ev of readdirSync(ROOT).sort()){const rd=join(ROOT,ev,'raw');if(!existsSync(rd)||ev==='kr-unseen')continue;
 let wave=null;try{wave=JSON.parse(readFileSync(join(ROOT,ev,'wave.json'),'utf8'));}catch{}
 for(const f of readdirSync(rd).filter(f=>f.endsWith('.html'))){const b=readFileSync(join(rd,f));const h=createHash('sha256').update(b).digest('hex');if(seen.has(h))continue;seen.add(h);
  const html=b.toString('utf8');const tag=f.replace('.html','');const w=wave?.pages?.find(p=>p.tag===tag);const url=w?.finalUrl??w?.url??'https://example.invalid/'+tag;
  let x=null;try{x=S.extractSpecifications245(html,url);}catch(e){inc('spec_throw');}
  inc('pages');if(x){inc('spec_facts',x.facts.length);inc('spec_ambiguous',x.ambiguous.length);
   const quantFacts=x.facts.filter(f=>['quantity','range','dimensions','number'].includes(f.value?.kind));inc('spec_quantity_facts',quantFacts.length);
   for(const a of x.ambiguous)for(const fl of a.flags??[a.reason??'unknown'])inc('amb_'+fl);
   if(x.mainProduct?.name)inc('pages_with_main_product');}
  const st=w?.sourceType??'unknown';const xx=T.testDocumentSubject268(x,st);
  let leads=[];try{leads=T.testLeadsFromHtml265(html,url,h,xx);}catch(e){inc('lead_throw');}
  const L=leads?.probe?.candidates??[];inc("tables226",leads?.probe?.tableResults226??0);inc("leads",L.length);for(const l of L){const s=T.screenTestLead265(l,{url,sha256:h});inc(s.ok?'leads_screened_ok':'lead_rej_'+s.reason);
   if(s.ok)inc('lead_subject_'+l.subjectAssignment);}
  try{const r=C7.comparativeResults270(html);inc('comparative',r.results.length);}catch{inc('cmp_throw');}
  try{const q=Q9.qualitativeObservations269(html);const obs=q.observations??q;inc('qual',obs.length);for(const o of obs)inc('qual_'+o.outcome);}catch(e){inc('qual_throw');}
 }}
console.log(C);
