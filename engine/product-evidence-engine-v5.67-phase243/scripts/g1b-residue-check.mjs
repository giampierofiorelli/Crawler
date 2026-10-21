#!/usr/bin/env node
/** G1b residues on the operational path (evaluation/g1b/preregistration.json, residues): expressed limits lost (M6) and
 * questions with a cause (M7), measured once on the G1 sealed set with the frozen build. NOT an independent measure for the
 * operational path: the same set already measured C0 in G1 (aggregates seen); the fixes were designed on spent material only.
 * GF is not run (it did not pass development). Public counts only. Never overwrites.
 * Usage: node scripts/g1b-residue-check.mjs LABEL --store STORE_COPY */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('store'))throw Error('usage: LABEL --store STORE_COPY');if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const E=new URL('../evaluation/',import.meta.url).pathname;const OUT=join(E,'g1b',`residue-check-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists');
const R=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1/r');const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const fz=JSON.parse(readFileSync(join(E,'g1','r-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(join(R,f))!==h)throw Error(f+' differs from its seal');
const REQ=JSON.parse(readFileSync(join(R,'requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(R,'reference.json'),'utf8')).items.map(x=>[x.id,x]));
const D='../dist/src/';const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const QK=await import(D+'quantity_knowledge.js');
mkdirSync(join(homedir(),'.cache-g1b'),{recursive:true});const copy=join(homedir(),'.cache-g1b',`residue-${LABEL}.sqlite`);copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const words=t=>new Set(String(t).toLowerCase().match(/[a-z]{4,}|\d+(?:\.\d+)?/g)??[]);
const kept=(a,c)=>{const w=[...words(c.text)];const nums=w.filter(x=>/\d/.test(x));const hay=JSON.stringify([a.constraints,a.unassessedObjectives,a.uninterpreted??[],a.otherLimits??[],a.quantityRequirements??[]]).toLowerCase();
 return nums.length?nums.every(n=>hay.includes(n)):w.some(x=>hay.includes(x));};
const T={expressed:0,lost:0,questions:0,withCause:0,unclassified:0,userOnly:0,userOnlyWhereReferenceHasUserUncertainty:0,notUnderstood:0,notUnderstoodWithLimitationStated:0};
for(const r of REQ){const ref=REF.get(r.id);const a=adviseFromRequest253(r.text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
 for(const k of (ref.expressed?.constraints??[]).filter(k=>['budget','size','noise','energy','time'].includes(k.kind))){T.expressed++;if(!kept(a,k))T.lost++;}
 const qc=a.questionCauses??[];T.questions+=a.questions.length;T.withCause+=qc.filter(c=>c.cause!=='unclassified').length;T.unclassified+=qc.filter(c=>c.cause==='unclassified').length;
 const uo=qc.filter(c=>c.cause==='user_only').length;T.userOnly+=uo;if(ref.userOnlyUncertainty&&ref.userOnlyUncertainty!=='none')T.userOnlyWhereReferenceHasUserUncertainty+=uo;
 const nu=qc.filter(c=>c.cause==='not_understood').length;T.notUnderstood+=nu;if(nu&&a.limitations.some(l=>/could not relate/.test(l)))T.notUnderstoodWithLimitationStated+=nu;}
writeFileSync(OUT,JSON.stringify({schema:'pee.g1b.residue-check.v1',label:LABEL,seal:fz.files,independence:'not independent for the operational path: G1 measured C0 on this set (aggregates seen); fixes designed on spent material only',
 g1Baseline:{expressed:32,lost:12,questionsWithCause:0},counts:T},null,1)+'\n');console.log(JSON.stringify(T));
