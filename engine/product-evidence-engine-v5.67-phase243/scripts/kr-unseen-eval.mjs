#!/usr/bin/env node
/**
 * KR unseen-document validation (2026-10-18). Protocol: evaluation/kr-unseen/protocol.json (committed before any request).
 * No network here: pages come from the bounded wave in the private evaluation directory (kr-unseen/wave.json, raw/).
 *   input                 sample the 1G table values of every fetched page (<= 60 per page, every k-th) and write the
 *                         annotator's input: rendered page text, values with labels and products, the knowledge's
 *                         kind, metric and condition ids. No output of any arm is included.
 *   freeze-gold           hash the sealed reference -> evaluation/kr-unseen/gold-freeze.json (no overwrite)
 *   run LABEL ARM ROOT    run one arm's build ONCE on the pages and score it against the sealed reference (no overwrite)
 * Public output: counts only. Private output: rows (pee-knowledge private-eval/kr-unseen).
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
// REHEARSAL ONLY: PEE_KRU_ROOT / PEE_KRU_PUB / PEE_KRU_PRIV point the same code at spent pages and scratch outputs.
const ROOT=process.env.PEE_KRU_ROOT??join(homedir(),'.local/share/product-evidence-engine/private-eval/kr-unseen');const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const PUB=process.env.PEE_KRU_PUB??'evaluation/kr-unseen';const PRIV=process.env.PEE_KRU_PRIV??join(REPO,'private-eval/kr-unseen');
const [cmd,...args]=process.argv.slice(2);
const wave=()=>JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));
const pages=()=>wave().pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval').map(p=>{const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(p.sha256&&sha(b)!==p.sha256)throw Error('page bytes differ from the receipt: '+p.tag);return {...p,html:b.toString('utf8')};});
const VALUE_KINDS=new Set(['quantity','range','bound','number']);
const sample=obs=>{const v=obs.filter(o=>VALUE_KINDS.has(o.kind));const k=Math.ceil(v.length/60)||1;return v.filter((_,i)=>i%k===0);};

if(cmd==='input'){
 const G=await import(resolve('dist/src/table_interpreter1g.js'));const Q=await import(resolve('dist/src/quantity_knowledge.js'));const qk=Q.loadQuantityKnowledge();
 const out={instructions:'see the annotation prompt',knowledge:{kinds:qk.pack.kinds.map(k=>({id:k.id,plain:k.plain??k.note??null})),metrics:qk.pack.metrics.map(m=>({id:m.id,label:m.label,note:m.note??null})),conditionAxes:qk.pack.conditionAxes.map(a=>({id:a.id}))},pages:{}};
 for(const p of pages()){const r=G.interpretDocumentTables1G(p.html,{text:'rendered'});const doc=G.documentModel1G(p.html);
  const values=r.tables.flatMap(t=>sample(t.observations).map(o=>({id:o.id,table:t.table,printed:o.surface,labels:[...o.property,...o.records],conditionLabels:o.conditions,product:o.product})));
  out.pages[p.tag]={url:p.finalUrl??p.url,category:p.category,text:doc.blocks.map(b=>b.text).filter(Boolean).join('\n').slice(0,90000),values};}
 mkdirSync(ROOT,{recursive:true});const s=JSON.stringify(out,null,1);writeFileSync(join(ROOT,'annotation-input.json'),s);
 console.log(JSON.stringify({pages:Object.keys(out.pages).length,values:Object.values(out.pages).map(p=>p.values.length),sha256:sha(s)}));process.exit(0);
}
if(cmd==='freeze-gold'){
 const f=join(PUB,'gold-freeze.json');if(existsSync(f))throw Error(f+' exists');const a=readFileSync(join(ROOT,'annotations.json'));const g=JSON.parse(a);
 const vals=Object.values(g.pages).flatMap(p=>p.values);const cnt=k=>vals.reduce((m,v)=>(m[String(v[k])]=(m[String(v[k])]??0)+1,m),{});
 writeFileSync(f,JSON.stringify({schema:'pee.kr-unseen.gold-freeze.v1',sealedAt:new Date().toISOString(),inputSha256:sha(readFileSync(join(ROOT,'annotation-input.json'))),annotationSha256:sha(a),
  annotator:g.annotator,pages:Object.keys(g.pages).length,values:vals.length,byIsQuantity:cnt('isQuantity'),byKind:cnt('kind'),byJustification:cnt('justification')},null,1)+'\n');console.log('sealed');process.exit(0);
}
if(cmd==='run'){
 const [label,arm,root]=args;if(!/^[a-z0-9.-]{2,40}$/.test(label??'')||!arm||!root)throw Error('usage: run LABEL ARM ROOT');
 const FR=JSON.parse(readFileSync(join(PUB,'gold-freeze.json'),'utf8'));const a=readFileSync(join(ROOT,'annotations.json'));if(sha(a)!==FR.annotationSha256)throw Error('reference differs from the sealed hash');
 const pubF=join(PUB,`score-${label}.json`),privF=join(PRIV,`score-${label}.json`);for(const f of [pubF,privF])if(existsSync(f))throw Error(f+' exists: never overwritten');mkdirSync(PRIV,{recursive:true});
 const Q=await import(join(resolve(root),'dist/src/quantity_knowledge.js'));const K=await import(join(resolve(root),'dist/src/table_interpreter1g_knowledge.js'));const qk=Q.loadQuantityKnowledge();
 const gold=JSON.parse(a);const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const rows=[];const perPage={};
 const meta=JSON.parse(readFileSync(join(PUB,'source-selection.json'),'utf8')).pages??[];
 for(const p of pages()){const g=gold.pages[p.tag];if(!g)continue;const cls=meta.find(m=>m.tag===p.tag)?.novelty??[];const pc=perPage[p.tag]={novelty:cls};const pinc=k=>pc[k]=(pc[k]??0)+1;
  const r=K.interpretWithKnowledge1G(p.html,qk);const obs=new Map(r.tables.flatMap(t=>t.observations).map(o=>[o.id,o]));
  const scored=[];
  for(const gv of g.values){const o=obs.get(gv.id);const q=o?.quantity??null;const kind=q?.kind.id??null;const multi=q?q.unit.kinds.length>1:null;
   let c;const gk=gv.isQuantity===false?'not_a_quantity':gv.kind;
   if(gk==='not_a_quantity')c=q?'unjustified_interpretation_not_a_quantity':'correct_not_typed';
   else if(!q)c='not_typed';
   else if(!kind)c=(gk==='ambiguous'||String(gk).startsWith('other'))?'correct_abstention':'unjustified_abstention';
   else c=kind===gk?'correct_interpretation':'unjustified_interpretation';
   inc('kind_'+c);pinc(c);if(multi)inc('multikind_unit_'+c);
   if(c==='correct_interpretation'&&q.kind.justification)inc('justification_'+(q.kind.justification.type===gv.justification?'agrees':'differs'));
   // conditions by axis
   const gAx=new Set((gv.conditions??[]).map(x=>String(x.axis??x).split(':')[0].trim()).filter(Boolean));const aAx=new Set((q?.conditions??[]).map(x=>x.axis));
   if(gk!=='not_a_quantity'&&q){for(const ax of gAx)inc(aAx.has(ax)?'condition_stated_by_both':'condition_missed_by_arm');for(const ax of aAx)if(!gAx.has(ax))inc('condition_unjustified_by_arm');}
   // scope: a protocol the arm applied vs the reference's applicable statement
   const fromProto=q?.kind.justification?.from==='protocol';
   if(q&&fromProto&&!gv.applicableStatement)inc('scope_unjustified_application');
   if(gv.applicableStatement&&['documented_method','standard'].includes(gv.justification)&&!fromProto&&!(kind&&kind===gk))inc('scope_unjustified_non_application');
   scored.push({gv,o,q,gk});rows.push({page:p.tag,id:gv.id,gold:gk,goldJustification:gv.justification,arm:kind,armJustification:q?.kind.justification??null,armConditions:q?.conditions??null,goldConditions:gv.conditions??[],cls:c,basis:q?.kind.basis??null});}
  // comparability within each table
  for(let i=0;i<scored.length;i++)for(let j=i+1;j<scored.length;j++){const x=scored[i],y=scored[j];
   if(x.gv.table!==y.gv.table||!x.q||!y.q||x.gk!==y.gk||['not_a_quantity','ambiguous'].includes(x.gk)||String(x.gk).startsWith('other'))continue;
   const goldComparable=!!x.gv.testGroup&&x.gv.testGroup===y.gv.testGroup;const v=Q.compareQuantities(qk,x.q,y.q).verdict;const armComparable=v==='comparable'||v==='comparable_within_source';
   inc('pairs');inc(goldComparable?(armComparable?'pair_comparable_both':'pair_unjustified_non_comparability'):(armComparable?'pair_unjustified_comparability':'pair_not_comparable_both'));}}
 const out={label,arm,root,knowledge:qk.identity,annotationSha256:FR.annotationSha256,generatedAt:new Date().toISOString(),evidenceTier:'T2-untouched first run on unseen pages (reference sealed before any arm ran)'};
 writeFileSync(pubF,JSON.stringify({...out,counts:C,perPage},null,1)+'\n');writeFileSync(privF,JSON.stringify({...out,counts:C,perPage,rows},null,1)+'\n');console.log(JSON.stringify(C,null,1));process.exit(0);
}
throw Error('commands: input | freeze-gold | run LABEL ARM ROOT');
