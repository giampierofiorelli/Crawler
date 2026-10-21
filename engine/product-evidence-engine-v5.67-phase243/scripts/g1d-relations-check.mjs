#!/usr/bin/env node
/** G1d relation check on the SEALED reference R (evaluation/g1d/ref-freeze.json; method frozen in
 * evaluation/g1d/relations-freeze.json). First run committed unchanged; refuses to run twice. Public counts only.
 * Usage: node scripts/g1d-relations-check.mjs --packages DIR --store COPY */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {TAUGHT_DOCS_LOADER} from './g1c-lib.mjs';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!arg('packages')||!arg('store'))throw Error('usage: --packages DIR --store COPY');if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const E0=new URL('../evaluation/g1d/',import.meta.url).pathname;const OUT=join(E0,'relations-check-firstrun.json');if(existsSync(OUT))throw Error('first run exists: never re-run');
const RD=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1d/ref');const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const seal=JSON.parse(readFileSync(join(E0,'ref-freeze.json'),'utf8'));for(const [f,h] of Object.entries(seal.files))if(sha(join(RD,f))!==h)throw Error(f+' differs from its seal');
const fz=JSON.parse(readFileSync(join(E0,'relations-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(new URL('../'+f,import.meta.url).pathname)!==h)throw Error(f+' differs from the frozen method');
const D='../dist/src/';const G=await import(D+'situation_knowledge_g1b.js');const RI=await import(D+'relation_integrity_g1d.js');const E=await import(D+'semantic_embedding_g1c.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const QK=await import(D+'quantity_knowledge.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const docs=TAUGHT_DOCS_LOADER(arg('packages'));mkdirSync(join(homedir(),'.cache-g1d'),{recursive:true});const copy=join(homedir(),'.cache-g1d','rel-check.sqlite');copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const P=G.buildProjectionG1b(s,docs,QK.loadQuantityKnowledge());
const REF=new Map(JSON.parse(readFileSync(join(RD,'reference.json'),'utf8')).items.map(x=>[x.item,x]));const KEY=JSON.parse(readFileSync(join(RD,'key.json'),'utf8')).items;
const all=RI.sourceRowsG1d(P,docs);const corpus=[...all.values()].flatMap(r=>r.cells.filter(c=>c.role!=='teaching').map(c=>c.text));
const rows=new Map(KEY.map(k=>[k.rowId,all.get(k.rowId)]));const missing=KEY.filter(k=>!all.get(k.rowId)).length;if(missing)throw Error(missing+' reference rows missing from the projection');
const R1=await RI.deriveRelationsG1d(rows,P.strategies,await E.loadEmbedderG1c(),{corpus});const r1=new Map(R1.map(r=>[r.rowId+'|'+r.strategy,r]));
const SIDS=P.strategies.map(x=>x.id),stored=new Map(P.strategies.map(x=>[x.id,x.storedUnder]));const pos=r=>r==='supported'||r==='conditional';
const score=(has,polarityOf)=>{const T={proposed:0,tp:0,fp:0,fn:0,referencePositives:0,polarityCorrect:0,contraindicatedProposedAsApplicable:0,referenceContraindicated:0,
 crossCategory:{referencePositives:0,tp:0},byStratum:{}};
 for(const k of KEY){const ref=REF.get(k.item);const row=rows.get(k.rowId);const st=(T.byStratum[k.stratum]??={proposed:0,tp:0,referencePositives:0});
  for(const sid of SIDS){const g=ref.relations[sid].relation;const p=has(k.rowId,sid);const cross=stored.get(sid)!==row.category;
   if(pos(g)){T.referencePositives++;st.referencePositives++;if(cross)T.crossCategory.referencePositives++;}if(g==='contraindicated')T.referenceContraindicated++;
   if(!p){if(pos(g))T.fn++;continue;}T.proposed++;st.proposed++;
   if(pos(g)){T.tp++;st.tp++;if(cross)T.crossCategory.tp++;const pol=polarityOf?.(k.rowId,sid);if(pol&&((pol==='applies'&&g==='supported')||(pol==='conditional'&&g==='conditional')))T.polarityCorrect++;}
   else T.fp++;
   if(g==='contraindicated'&&(polarityOf?.(k.rowId,sid)??'applies')!=='contraindicated')T.contraindicatedProposedAsApplicable++;}}
 T.precision=+(T.tp/Math.max(1,T.proposed)).toFixed(3);T.recall=+(T.tp/Math.max(1,T.referencePositives)).toFixed(3);return T;};
const R0=new Set(KEY.flatMap(k=>k.g1bLinks.map(x=>k.rowId+'|'+x)));
const res={R0:score((r,sid)=>R0.has(r+'|'+sid)),R1:score((r,sid)=>r1.has(r+'|'+sid),(r,sid)=>r1.get(r+'|'+sid)?.polarity)};
const catTerms=c=>{const e=CATEGORY_REGISTRY250.find(x=>x.id===c);return [c.replace(/_/g,' '),...(e?.aliases??[])];};
const cat={R1:{agree:0,confusion:{}},allSuitable:{agree:0},allConditional:{agree:0},refDistribution:{},conditionKinds:{}};
for(const k of KEY){const g=REF.get(k.item).category;const pr=RI.categoryApplicabilityG1d(rows.get(k.rowId),catTerms(rows.get(k.rowId).category)).value;
 cat.refDistribution[g.value]=(cat.refDistribution[g.value]??0)+1;if(g.conditionKind)cat.conditionKinds[g.conditionKind]=(cat.conditionKinds[g.conditionKind]??0)+1;
 if(pr===g.value)cat.R1.agree++;cat.R1.confusion[`${g.value}->${pr}`]=(cat.R1.confusion[`${g.value}->${pr}`]??0)+1;
 if(g.value==='suitable')cat.allSuitable.agree++;if(g.value==='conditional')cat.allConditional.agree++;}
mkdirSync(join(RD,'..','check'),{recursive:true});writeFileSync(join(RD,'..','check','relations-firstrun-detail.json'),JSON.stringify(R1,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1d.relations-check.v1',status:'first run, unchanged',reference:'sealed R (evaluation/g1d/ref-freeze.json): 100 rows x 9 strategies',
 method:fz.version,R0:'G1b links (g1b.4)',relations:res,category:cat,note:'Claude-agent reference read from sources, not expert validation'},null,1)+'\n');
console.log(JSON.stringify({R0:{p:res.R0.proposed,tp:res.R0.tp,prec:res.R0.precision,rec:res.R0.recall},R1:{p:res.R1.proposed,tp:res.R1.tp,prec:res.R1.precision,rec:res.R1.recall,pol:res.R1.polarityCorrect,contra:res.R1.contraindicatedProposedAsApplicable},refPos:res.R0.referencePositives,refContra:res.R0.referenceContraindicated,cat:{R1:cat.R1.agree,allSuitable:cat.allSuitable.agree,allConditional:cat.allConditional.agree,dist:cat.refDistribution}}));
