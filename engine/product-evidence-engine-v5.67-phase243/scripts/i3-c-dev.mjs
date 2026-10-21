#!/usr/bin/env node
/** Third increment C, development runner (spent material only: R3-P needs requests and N1 Q requests with their
 * adjudicated references; evaluation/i3/preregistration.json material.development.C). Reference family = the reference
 * category; "named" = the N1 author's flag, or for R3-P a registry alias in the text. Approximate by design: development
 * references have no plausible-family lists, so every hypothesis other than the reference category counts as "other".
 * Usage: node scripts/i3-c-dev.mjs LABEL --store STORE_COPY (writes evaluation/i3/c-dev-LABEL.json counts; detail privately) */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('store'))throw Error('usage: LABEL --store STORE_COPY');
const OUT=new URL(`../evaluation/i3/c-dev-${LABEL}.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const D=new URL('../dist/src/',import.meta.url).pathname;const I=m=>import(join(D,m));
const {KnowledgeStore246}=await I('phase246_knowledge_store.js');const {adviseFromRequest253}=await I('phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await I('phase248_category_registry.js');const {goalUnderstandingC}=await I('goal_understanding_c.js');const QK=await I('quantity_knowledge.js');
const copy=join(homedir(),'.cache-i2','n1',`c-dev-${LABEL}.sqlite`);copyFileSync(arg('store'),copy);const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const J=f=>JSON.parse(readFileSync(f,'utf8'));
const cases=[];
const r3=J(join(PE,'r3p/needs/requests.json')).requests,r3r=new Map(J(join(PE,'r3p/needs/reference.json')).requests.map(r=>[r.id,r]));
const alias=t=>CATEGORY_REGISTRY250.some(e=>e.aliases.some(a=>new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}s?\\b`,'i').test(t)));
for(const r of r3){const ref=r3r.get(r.id);if(!ref||ref.notABuyingRequest)continue;cases.push({id:'r3p:'+r.id,text:r.text,family:ref.category==='other'?null:ref.category,named:alias(r.text)});}
const qa=new Map(J(join(PE,'n1/q/q-requests-authored.json')).requests.map(r=>[r.id,r]));
for(const r of J(join(PE,'n1/q/requests.json')).requests)cases.push({id:'q:'+r.id,text:r.text,family:qa.get(r.id).category,named:qa.get(r.id).named});
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const rows=[];
for(const c of cases){const a=adviseFromRequest253(c.text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});const g=c.named?'named':'unnamed';
 const arms={C0:{committed:a.category??null,hyps:a.category?[a.category]:[],action:a.category?'commit':'abstain'}};
 for(const [arm,claims] of [['C1',false],['C2',true]]){const u=goalUnderstandingC(c.text,a,s,{qk,claims});arms[arm]={committed:u.committed,hyps:[...new Set([...(u.committed?[u.committed]:[]),...u.hypotheses.map(h=>h.family)])],action:u.action,question:u.question?.text??null,requested:u.requested};}
 for(const [arm,x] of Object.entries(arms)){for(const k of [g,'all']){inc(`${k}|${arm}|cases`);
   inc(`${k}|${arm}|hit`,c.family&&x.hyps.includes(c.family)?1:0);inc(`${k}|${arm}|other_families`,x.hyps.filter(f=>f!==c.family).length);
   inc(`${k}|${arm}|commit`,x.action==='commit'?1:0);inc(`${k}|${arm}|commit_wrong`,x.action==='commit'&&x.committed!==c.family?1:0);
   inc(`${k}|${arm}|ask`,x.action==='ask'?1:0);inc(`${k}|${arm}|abstain`,x.action==='abstain'?1:0);}}
 rows.push({id:c.id,family:c.family,named:c.named,arms});}
mkdirSync(join(PE,'i3','dev'),{recursive:true});writeFileSync(join(PE,'i3','dev',`c-dev-${LABEL}.json`),JSON.stringify(rows,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.i3.c-dev.v1',label:LABEL,status:'development (spent material; approximate reference)',totals:T},null,1)+'\n');
for(const g of ['named','unnamed'])console.log(g,['C0','C1','C2'].map(a=>`${a} hit ${T[`${g}|${a}|hit`]}/${T[`${g}|${a}|cases`]} other ${T[`${g}|${a}|other_families`]} commit ${T[`${g}|${a}|commit`]} wrong ${T[`${g}|${a}|commit_wrong`]} ask ${T[`${g}|${a}|ask`]} abst ${T[`${g}|${a}|abstain`]}`).join(' || '));
