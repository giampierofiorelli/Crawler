#!/usr/bin/env node
/** Phase257 — operator commands for the research policy (no network, no store write).
 *  verify  : load $PEE_RESEARCH_POLICY (default ~/.local/share/product-evidence-engine/research-policy/research-policy.json) strictly.
 *  restore : copy the durable copy (pee-knowledge/policy/research-policy.json) to the protected location (dir 0700,
 *            file 0600); refuses to replace a higher revision. The durable copy itself is never used directly.
 *  demo    : on a copy of the snapshot, answer the Phase254 gold requests, collect research needs, plan each policy
 *            category and dry-run the plans. Output: ids, kinds, statuses and counts only.
 * Usage: node scripts/phase257-research-policy.mjs verify|restore|demo [--snapshot FILE] [--out FILE]
 */
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync,chmodSync,existsSync} from 'node:fs';import {resolve,join,dirname} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const F=Object.fromEntries(process.argv.slice(3).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const base=join(homedir(),'.local','share','product-evidence-engine');
const POLICY=process.env.PEE_RESEARCH_POLICY??join(base,'research-policy','research-policy.json');
const DURABLE=process.env.PEE_RESEARCH_POLICY_DURABLE??'/home/user/pee-knowledge/policy/research-policy.json';
const {loadResearchPolicy257,validateResearchPolicy257,planResearchFromNeeds257,executeUnderPolicy257}=await import('../dist/src/phase257_research_planning.js');
const cmd=process.argv[2];
if(cmd==='verify'){const p=loadResearchPolicy257(POLICY);console.log(JSON.stringify({valid:true,policyId:p.policyId,revision:p.revision,market:p.market,expiresAt:p.expiresAt,categories:p.categories,needKinds:p.needKinds}));}
else if(cmd==='restore'){
 const incoming=validateResearchPolicy257(JSON.parse(readFileSync(DURABLE,'utf8')),new Date());
 if(existsSync(POLICY)){const cur=JSON.parse(readFileSync(POLICY,'utf8'));if(cur.policyId===incoming.policyId&&cur.revision>incoming.revision)throw Error(`refusing to replace revision ${cur.revision} with ${incoming.revision}`);}
 mkdirSync(dirname(POLICY),{recursive:true,mode:0o700});chmodSync(dirname(POLICY),0o700);
 copyFileSync(DURABLE,POLICY);chmodSync(POLICY,0o600);const p=loadResearchPolicy257(POLICY);console.log(JSON.stringify({restored:true,revision:p.revision,path:POLICY}));}
else if(cmd==='demo'){
 const {KnowledgeStore246}=await import('../dist/src/phase246_knowledge_store.js');
 const {CATEGORY_REGISTRY250}=await import('../dist/src/phase248_category_registry.js');
 const {adviseFromRequest253}=await import('../dist/src/phase253_request_advice.js');
 const {collectResearchNeeds254}=await import('../dist/src/phase254_research_needs.js');
 const snap=resolve(F.snapshot??'/home/user/pee-knowledge/snapshot/pee246.sqlite');const dir=join(base,'arms257');mkdirSync(dir,{recursive:true});
 const db=join(dir,'demo.sqlite');for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});copyFileSync(snap,db);
 // Logical content (every table's rows), not file bytes: opening a store sets WAL mode and rewrites the header.
 const {DatabaseSync}=await import('node:sqlite');
 const content=()=>{const d=new DatabaseSync(db,{readOnly:true});const t=d.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(r=>r.name);
  const h=createHash('sha256');for(const n of t)h.update(n+JSON.stringify(d.prepare('SELECT * FROM "'+n+'"').all()));d.close();return h.digest('hex');};
 const before=content();
 const store=new KnowledgeStore246(db);const gold=JSON.parse(readFileSync('evaluation/phase254/research-needs-gold.json','utf8'));
 const needs=collectResearchNeeds254(gold.cases.map(c=>adviseFromRequest253(c.text,store,CATEGORY_REGISTRY250)),store,{maxResearch:20});store.close();
 const policy=loadResearchPolicy257(POLICY);const now=new Date();const fp=createHash('sha256').update(readFileSync(snap)).digest('hex');
 const label={air_fryers:'Air fryers',coffee_machines:'Coffee machines',kettles:'Kettles',toasters:'Toasters',blenders:'Blenders'};
 const plans=[];
 for(const c of policy.categories){const pl=planResearchFromNeeds257({needs,categoryId:c,categoryLabel:label[c]??c,policy,asOf:now.toISOString(),now,knowledgeFingerprint:fp});
  const r=pl.plan.jobs.length?await executeUnderPolicy257({plan:pl.plan,policyPath:POLICY}):null;
  plans.push({categoryId:c,jobs:pl.jobs.map(j=>({jobId:j.jobId,gapKind:pl.plan.jobs.find(x=>x.jobId===j.jobId).gapKind,productId:j.productId,criterion:j.criterion,exactVariantVerified:j.identity.exactVariantVerified,identityState:j.identity.identityState})),
   heldByReason:pl.held.reduce((m,h)=>(m[h.reason]=(m[h.reason]??0)+1,m),{}),omittedByBudget:pl.plan.omittedByBudget,planHash:pl.plan.planHash,
   dryRun:r?{statuses:r.run.outcomes.map(o=>o.status),sourceReads:r.run.sourceRetrievalAttempts,canonicalKnowledgeUpdated:r.run.canonicalKnowledgeUpdated,rankingAuthorized:r.run.rankingAuthorized}:null});}
 const after=content();
 const out={schema:'pee257.demo.v1',policy:{policyId:policy.policyId,revision:policy.revision,market:policy.market},needsSummary:needs.summary,plans,
  totals:{jobs:plans.reduce((s,p)=>s+p.jobs.length,0),sourceReads:plans.reduce((s,p)=>s+(p.dryRun?.sourceReads??0),0)},storeCopyUnchanged:before===after};
 const txt=JSON.stringify(out,null,1)+'\n';if(F.out)writeFileSync(resolve(F.out),txt);
 console.log(JSON.stringify({totals:out.totals,storeCopyUnchanged:out.storeCopyUnchanged,needsSummary:needs.summary}));
 for(const p of plans)console.log(p.categoryId,'jobs',p.jobs.length,JSON.stringify(p.jobs.map(j=>j.gapKind).reduce((m,k)=>(m[k]=(m[k]??0)+1,m),{})),'held',JSON.stringify(p.heldByReason),'dry-run',JSON.stringify(p.dryRun?.statuses?.reduce((m,k)=>(m[k]=(m[k]??0)+1,m),{})??null),'reads',p.dryRun?.sourceReads??0);
}
else throw Error('usage: verify|restore|demo');
