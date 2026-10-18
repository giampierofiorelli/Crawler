#!/usr/bin/env node
/** R1: equivalence replay of the comparability program, rules.v2 (kr.2) vs rules.v3 (kr.3), on every retained page.
 *   node scripts/r1-compare-replay.mjs LABEL   writes evaluation/r1/compare-replay-LABEL.json (counts only) */
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const label=process.argv[2];const OUT=`evaluation/r1/compare-replay-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const W=await import(D+'document_evidence.js');
const R=new URL('../resources/quantity-knowledge/',import.meta.url);const v2=QK.loadQuantityKnowledge(undefined,JSON.parse(readFileSync(new URL('rules.v2.json',R),'utf8')));const v3=QK.loadQuantityKnowledge();
const ROOT=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const seen=new Set();const C={};const inc=k=>C[k]=(C[k]??0)+1;
for(const ev of readdirSync(ROOT).sort()){const rd=join(ROOT,ev,'raw');if(!existsSync(rd))continue;for(const f of readdirSync(rd).filter(f=>f.endsWith('.html')).sort()){const b=readFileSync(join(rd,f));const h=createHash('sha256').update(b).digest('hex');if(seen.has(h))continue;seen.add(h);inc('pages');
 const doc=W.readDocumentEvidence(b.toString('utf8'),v3,{sourceType:'independent_review'});
 const typed=[...doc.quantities.filter(q=>!q.identifierPart&&q.quantity?.kind.id&&q.product).map(q=>({q:q.quantity,p:q.product})),...doc.tables.tables.flatMap(t=>t.observations.filter(o=>o.quantity?.kind.id&&o.product).map(o=>({q:o.quantity,p:o.product})))];
 let n=0;for(let i=0;i<typed.length&&n<400;i++)for(let j=i+1;j<typed.length&&n<400;j++){const x=typed[i],y=typed[j];if(x.p!==y.p||x.q.kind.id!==y.q.kind.id)continue;n++;inc('pairs');
  const a=QK.compareQuantities(v2,x.q,y.q),c=QK.compareQuantities(v3,x.q,y.q);
  if(a.verdict!==c.verdict)inc(`verdict_changed:${a.verdict}->${c.verdict}`);
  const ra=a.rules.includes('F10'),rb=c.rules.includes('F10b');if(ra)inc('v2_different_condition');if(ra&&rb)inc('v3_now_not_shown_equal');if(ra&&c.rules.includes('F10'))inc('v3_still_documented_different');}}}
writeFileSync(OUT,JSON.stringify({schema:'pee.r1.compare-replay.v1',label,generatedAt:new Date().toISOString(),reference:'rules.v2.json (kr.2)',candidate:'rules.v3.json (kr.3)',counts:C},null,1)+'\n');console.log(JSON.stringify(C));
