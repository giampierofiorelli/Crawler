#!/usr/bin/env node
/** G1d relation reference R (evaluation/g1d/preregistration.json material.reference): merge two blind annotations of 100
 * never-audited rows with the blind third adjudication, write the private reference and seal every file by SHA-256 in
 * evaluation/g1d/ref-freeze.json BEFORE any relation method runs on it. Public: hashes and agreement only. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const D=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1d/ref');const J=f=>JSON.parse(readFileSync(join(D,f),'utf8'));
const OUT=new URL('../evaluation/g1d/ref-freeze.json',import.meta.url).pathname;if(existsSync(OUT)||existsSync(join(D,'reference.json')))throw Error('already sealed');
const I=J('input.json'),S=I.strategies.map(s=>s.id),A=[J('annot-1.json'),J('annot-2.json')].map(a=>new Map(a.items.map(x=>[x.item,x])));
const adj=new Map(J('adj.json').items.map(x=>[x.item,x.decisions]));
const pair=(a,it,s)=>(a.get(it).pairs??[]).find(p=>p.strategy===s)??{relation:'not_addressed'};
const ref=[];let rAgree=0,rTot=0,cAgree=0;const conf={};
for(const x of I.items){const it=x.item,d=adj.get(it)??[];const rel={};
 for(const s of S){const a=pair(A[0],it,s),b=pair(A[1],it,s);rTot++;
  if(a.relation===b.relation){rAgree++;rel[s]={relation:a.relation,condition:a.condition||b.condition||'',quote:a.quote||b.quote||'',nature:a.nature||b.nature||'',by:'agreement'};}
  else{const z=d.find(q=>q.field==='relation'&&q.strategy===s);if(!z)throw Error('unadjudicated '+it+' '+s);
   const src=[a,b].find(p=>p.relation===z.value)??{};rel[s]={relation:z.value,condition:src.condition||'',quote:src.quote||'',nature:src.nature||'',by:'adjudication'};}}
 const ca=A[0].get(it),cb=A[1].get(it);let cat;
 if(ca.category===cb.category){cAgree++;cat={value:ca.category,condition:ca.categoryCondition||cb.categoryCondition||'',conditionKind:ca.conditionKind||cb.conditionKind||'',quote:ca.categoryQuote||cb.categoryQuote||'',by:'agreement'};}
 else{const z=d.find(q=>q.field==='category');if(!z)throw Error('unadjudicated category '+it);const src=[ca,cb].find(c=>c.category===z.value)??{};
  cat={value:z.value,condition:z.categoryCondition||src.categoryCondition||'',conditionKind:z.conditionKind||src.conditionKind||'',quote:src.categoryQuote||'',by:'adjudication'};}
 const k=`${ca.category}|${cb.category}`;conf[k]=(conf[k]??0)+1;
 ref.push({item:it,extraction:[ca.extraction,cb.extraction],sourceStatus:ca.sourceStatus||cb.sourceStatus||'none',category:cat,relations:rel});}
writeFileSync(join(D,'reference.json'),JSON.stringify({schema:'pee.g1d.relation-reference.v1',items:ref},null,1));
const sha=f=>createHash('sha256').update(readFileSync(join(D,f))).digest('hex');
const files=Object.fromEntries(['input.json','guide.md','annot-1.json','annot-2.json','adj-input.json','adj.json','reference.json','key.json'].map(f=>[f,sha(f)]));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1d.ref-freeze.v1',date:new Date().toISOString().slice(0,10),
 sealedBefore:'any relation method (R0, R1) is run on R; never used for development',location:'$PEE_PRIVATE_EVAL_DIR/g1d/ref/',files,
 agreement:{relationPairs:rTot,relationAgreement:rAgree,categoryItems:I.items.length,categoryAgreement:cAgree,adjudicatedItems:adj.size},
 annotators:'two blind Claude agents (R1, R2) and a blind third adjudicator (R3), source-only judgements; not independent expert validation'},null,1)+'\n');
console.log(readFileSync(OUT,'utf8'));
