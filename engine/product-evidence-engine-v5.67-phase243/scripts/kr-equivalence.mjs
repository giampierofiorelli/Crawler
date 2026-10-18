#!/usr/bin/env node
/**
 * KR equivalence check (2026-10-18): the declarative-rules build against a reference build on the 69 retained pages.
 * For every typed value it compares kind, justification (type, place) and metric; for every pair of typed values of
 * one table that can be the same kind it compares the comparability verdict. Differences are listed for review
 * (corrections are measured separately from regressions; nothing is assumed identical).
 *
 *   node scripts/kr-equivalence.mjs LABEL REFERENCE_ENGINE_ROOT
 *
 * Public output: counts only (evaluation/knowledge-rules). Full rows: pee-knowledge private-eval/knowledge-rules.
 * Never overwrites. Development evidence on spent pages.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [label,refRoot]=process.argv.slice(2);if(!/^[a-z0-9.-]{2,40}$/.test(label??'')||!refRoot)throw Error('usage: LABEL REFERENCE_ENGINE_ROOT');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const PUB=join('evaluation/knowledge-rules',`equivalence-${label}.json`),PRIV=join(REPO,'private-eval/knowledge-rules',`equivalence-${label}.json`);
for(const f of [PUB,PRIV])if(existsSync(f))throw Error(f+' exists: never overwritten');mkdirSync('evaluation/knowledge-rules',{recursive:true});mkdirSync(join(REPO,'private-eval/knowledge-rules'),{recursive:true});
const load=async root=>({Q:await import(join(resolve(root),'dist/src/quantity_knowledge.js')),K:await import(join(resolve(root),'dist/src/table_interpreter1g_knowledge.js'))});
const N=await load('.'),O=await load(refRoot);const qn=N.Q.loadQuantityKnowledge(),qo=O.Q.loadQuantityKnowledge();
const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');const sha=b=>createHash('sha256').update(b).digest('hex');
const pages=[];const seen=new Set();for(const ev of readdirSync(ROOT).sort()){const rd=join(ROOT,ev,'raw');if(!existsSync(rd))continue;
 for(const f of readdirSync(rd).filter(f=>f.endsWith('.html')).sort()){const b=readFileSync(join(rd,f));const h=sha(b);if(seen.has(h))continue;seen.add(h);pages.push({key:ev+'/'+f.replace(/\.html$/,''),html:b.toString('utf8')});}}
const C={};const inc=k=>C[k]=(C[k]??0)+1;const rows=[];let msN=0,msO=0;
for(const p of pages){inc('pages');
 let t0=Date.now();const rn=N.K.interpretWithKnowledge1G(p.html,qn);msN+=Date.now()-t0;t0=Date.now();const ro=O.K.interpretWithKnowledge1G(p.html,qo);msO+=Date.now()-t0;
 for(const [tn,to] of rn.tables.map((t,i)=>[t,ro.tables[i]])){const om=new Map(to.observations.map(o=>[o.id,o]));
  for(const o of tn.observations){const b=om.get(o.id);const qa=o.quantity,qb=b?.quantity;if(!qa&&!qb)continue;inc('typed_values');
   if(!!qa!==!!qb){inc('value_typed_in_one_build_only');rows.push({page:p.key,obs:o.id,what:'typed',now:!!qa,ref:!!qb});continue;}
   const ka=qa.kind.id,kb=qb.kind.id;if(ka!==kb){inc('kind_differs');rows.push({page:p.key,obs:o.id,what:'kind',now:ka,ref:kb,nowBasis:qa.kind.basis,refBasis:qb.kind.basis});}
   const ja=`${qa.kind.justification.type}@${qa.kind.justification.from}`,jb=`${qb.kind.justification.type}@${qb.kind.justification.from}`;
   if(ja!==jb){inc('justification_differs');inc(`justification_${jb}_to_${ja}`);rows.push({page:p.key,obs:o.id,what:'justification',now:ja,ref:jb,kind:ka,nowEvidence:qa.kind.justification.evidence,refEvidence:qb.kind.justification.evidence});}
   if(qa.metric.id!==qb.metric.id){inc('metric_differs');rows.push({page:p.key,obs:o.id,what:'metric',now:qa.metric.id,ref:qb.metric.id});}
   if(qa.kind.justification.rules?.length)inc('values_with_rule_derivation');}
  // pairs of one table that can be the same kind
  const tv=tn.observations.filter(o=>o.quantity&&!o.sameAs),tvo=new Map(to.observations.map(o=>[o.id,o]));
  for(let i=0;i<tv.length;i++)for(let j=i+1;j<tv.length;j++){const a=tv[i],b=tv[j];const ca=a.quantity.kind.id?[a.quantity.kind.id]:a.quantity.kind.candidates,cb=b.quantity.kind.id?[b.quantity.kind.id]:b.quantity.kind.candidates;
   if(!ca.some(k=>cb.includes(k)))continue;const oa=tvo.get(a.id)?.quantity,ob=tvo.get(b.id)?.quantity;if(!oa||!ob)continue;inc('pairs');
   const vn=N.Q.compareQuantities(qn,a.quantity,b.quantity),vo=O.Q.compareQuantities(qo,oa,ob);inc('verdict_'+vn.verdict);
   if(vn.verdict!==vo.verdict){inc('verdict_differs');inc(`verdict_${vo.verdict}_to_${vn.verdict}`);rows.push({page:p.key,pair:[a.id,b.id],what:'verdict',now:vn.verdict,ref:vo.verdict,nowReasons:vn.reasons,refReasons:vo.reasons,nowRules:vn.rules});}
   else if(vn.reasons.join('|').replace(/[_ ]/g,'')!==vo.reasons.join('|').replace(/[_ ]/g,''))inc('verdict_same_reason_wording_differs');}}}
C.ms_rules_build=msN;C.ms_reference_build=msO;
const meta={label,knowledge:qn.identity,reference:{root:refRoot,knowledge:qo.identity},generatedAt:new Date().toISOString(),evidenceTier:'T2 development comparison on SPENT pages (not held-out)'};
writeFileSync(PUB,JSON.stringify({...meta,counts:C},null,1)+'\n');writeFileSync(PRIV,JSON.stringify({...meta,counts:C,rows},null,1)+'\n');console.log(JSON.stringify(C,null,1));
