#!/usr/bin/env node
/** G1c residue (evaluation/g1c/preregistration.json residue): expressed limits lost on the operational path, measured on
 * the development-only limits set written by an independent Claude agent (private-eval/g1c/limits-dev.json: 50 messages,
 * 98 limits with exact spans; never used for validation). Same "kept" rule as scripts/g1b-residue-check.mjs (a limit is
 * kept when its number, or one of its words, appears in the answer's constraints, unassessed objectives, uninterpreted
 * or other limits, or quantity requirements). Public counts only; lost spans private. Never overwrites.
 * Usage: node scripts/g1c-limits-dev.mjs LABEL --store STORE_COPY */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('store'))throw Error('usage: LABEL --store STORE_COPY');if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const OUT=new URL(`../evaluation/g1c/limits-dev-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1c');const SET=JSON.parse(readFileSync(join(PE,'limits-dev.json'),'utf8')).items;
const D='../dist/src/';const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const QK=await import(D+'quantity_knowledge.js');
mkdirSync(join(homedir(),'.cache-g1c'),{recursive:true});const copy=join(homedir(),'.cache-g1c',`limits-${LABEL}.sqlite`);copyFileSync(arg('store'),copy);
const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const words=t=>new Set(String(t).toLowerCase().match(/[a-z]{4,}|\d+(?:\.\d+)?/g)??[]);
const kept=(a,span)=>{const w=[...words(span)];const nums=w.filter(x=>/\d/.test(x));const hay=JSON.stringify([a.constraints,a.unassessedObjectives,a.uninterpreted??[],a.otherLimits??[],a.quantityRequirements??[],a.unmappedConstraints??[]]).toLowerCase();
 return nums.length?nums.every(n=>hay.includes(n)):w.some(x=>hay.includes(x));};
const T={messages:SET.length,expressed:0,lost:0,byKind:{}};const lost=[];
for(const r of SET){const a=adviseFromRequest253(r.text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
 for(const l of r.limits){T.expressed++;const k=(T.byKind[l.kind]??={expressed:0,lost:0});k.expressed++;
  if(!kept(a,l.span)){T.lost++;k.lost++;lost.push({id:r.id,kind:l.kind,span:l.span,constraints:(a.constraints??[]).map(c=>c.span??c.text??c.kind)});}}}
mkdirSync(join(PE,'limits'),{recursive:true});writeFileSync(join(PE,'limits',`lost-${LABEL}.json`),JSON.stringify(lost,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1c.limits-dev.v1',label:LABEL,material:'development-only limits set (independent Claude agent; never validation)',rule:'scripts/g1b-residue-check.mjs kept rule (+ unmappedConstraints)',counts:T},null,1)+'\n');
console.log(JSON.stringify(T));
