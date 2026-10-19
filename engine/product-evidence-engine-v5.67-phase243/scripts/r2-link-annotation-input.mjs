#!/usr/bin/env node
/**
 * R2: the input of the blind link annotation for set s1cd (Step 1C and Step 1D-B pages of taught categories). The
 * annotator sees the taught measurements (as the store holds them) and the values of the sealed value references, never
 * any reader output. Written to $PE/r2/links-s1cd/ (private: values and notes come from third-party pages).
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const D=new URL('../dist/src/',import.meta.url).href;
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');const OUT=join(PE,'r2/links-s1cd');
if(existsSync(join(OUT,'input.json')))throw Error('input exists: '+OUT);mkdirSync(OUT,{recursive:true});
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {relations247}=await import(D+'phase247_category_relations.js');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const values=[];
for(const dir of ['step1c','step1d-b']){const G=JSON.parse(readFileSync(join(PE,dir,'gold.json'),'utf8'));const W=JSON.parse(readFileSync(join(PE,dir,'wave.json'),'utf8'));
 for(const p of W.pages.filter(p=>TAUGHT.includes(p.category)&&existsSync(join(PE,dir,'raw',p.tag+'.html'))))
  for(const v of G.values.filter(v=>v.doc===p.tag))values.push({id:v.id,category:p.category,doc:v.doc,value:v.value,unit:v.unit,subject:v.subject,conditions:v.conditions??[],note:v.note??''});}
const cats=[...new Set(values.map(v=>v.category))].sort();
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const measurements={};
for(const c of cats){const items=store.categoryItems246(c);const rels=relations247(store,c);const byItem=new Map(items.map(i=>[i.itemId,i]));
 const cond=new Set(rels.filter(r=>r.kind==='requires_condition').map(r=>byItem.get(r.to.slice(5))?.concept?.id).filter(Boolean));const seen=new Set();
 measurements[c]=items.filter(i=>i.concept?.kind==='measurement').filter(i=>!seen.has(i.concept.id)&&seen.add(i.concept.id)).map(i=>({id:i.concept.id,statement:i.statement,isTestCondition:cond.has(i.concept.id)}));}
store.close();
writeFileSync(join(OUT,'input.json'),JSON.stringify({measurements,values},null,1)+'\n');copyFileSync(join(PE,'r1v/links/prompt.md'),join(OUT,'prompt.md'));
console.log(cats,values.length,Object.fromEntries(cats.map(c=>[c,values.filter(v=>v.category===c).length])));
