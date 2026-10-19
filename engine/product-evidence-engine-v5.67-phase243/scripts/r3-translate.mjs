#!/usr/bin/env node
/**
 * R3: run PEE's translator (src/knowledge_translation.ts) on the selected owner packages, on one side of the sealed
 * section split, and score it mechanically against the blind inventory of that side: a unit is reached when a statement
 * of a compatible type starts on a line inside the unit's lines; a statement is supported when some unit covers its line.
 * Mechanical matching is a development measure only; the fidelity judgement (faithful / partial / distorted /
 * unjustified) is done blind on the held-out side (scripts/r3-fidelity-*.mjs).
 *   node scripts/r3-translate.mjs LABEL --side dev|heldout   -> evaluation/r3/translate-LABEL.json (counts); private detail
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const args=process.argv.slice(2);const label=args[0];const side=args[args.indexOf('--side')+1];
const OUT=`evaluation/r3/translate-${label}.json`;if(!label||existsSync(OUT)||!['dev','heldout'].includes(side))throw Error('usage: LABEL --side dev|heldout');
const D=new URL('../dist/src/',import.meta.url).href;const sha=b=>createHash('sha256').update(b).digest('hex');
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const QK=await import(D+'quantity_knowledge.js');const KT=await import(D+'knowledge_translation.js');const KL=await import(D+'knowledge_link.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const qk=QK.loadQuantityKnowledge();
const split=JSON.parse(readFileSync(join(PE,'r3/section-split.json'),'utf8'));
const fz=JSON.parse(readFileSync('evaluation/r3/inventory-freeze.json','utf8'));
for(const f of fz.files)if(sha(readFileSync(join(PE,'r3/inventory',f.file)))!==f.sha256)throw Error('inventory changed: '+f.file);
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const COMPAT={limitation:['limitation','not_sufficient','not_comparable','applicability'],experimental_method:['measured_by','requires','composed_of','method_step'],
 conditional_claim:['requires','depends_on','not_comparable','applicability','not_sufficient','limitation'],causal_claim:['depends_on','increases','decreases','not_sufficient'],
 mechanism:['depends_on','increases','decreases'],physical_relation:['depends_on','increases','decreases','composed_of'],chemical_relation:['depends_on','increases','decreases'],
 compound_procedure:['composed_of','measured_by','method_step'],applicability:['applicability','not_comparable','limitation','requires'],definition:['composed_of','measured_by','definition'],
 quantitative_evidence:['quantitative_finding'],expert_judgement:['bears_on_outcome','limitation','not_sufficient'],consumer_outcome:['bears_on_outcome'],conflict:['not_comparable'],source_observation:['measured_by','limitation','quantitative_finding']};
const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const detail={};
for(const [cat,d] of Object.entries(split.docs)){const md=readFileSync(join(PE,'r1v/packages',d.file),'utf8');
 const items=store.categoryItems246(cat).filter(i=>i.concept);const concepts=items.map(i=>({id:i.concept.id,statement:i.statement,aliases:i.concept.aliases}));
 const r=KT.translateDocument(qk,md,{source:cat,concepts,range:d[side].map(s=>({start:s.start,end:s.end}))});
 const units=JSON.parse(readFileSync(join(PE,'r3/inventory',`${cat}-${side}.json`),'utf8')).units;
 const span=u=>{const m=/(\d+)\s*-\s*(\d+)/.exec(String(u.lines));return m?[+m[1],+m[2]]:[+u.lines,+u.lines];};
 inc('units',units.length);inc('units_high',units.filter(u=>u.importance==='high').length);inc('statements',r.statements.length);inc('clauses',r.clauses);inc('unrecognised',r.unrecognised);
 const reached=units.map(u=>{const [a,b]=span(u);return r.statements.some(s=>s.provenance.line>=a&&s.provenance.line<=b&&(COMPAT[u.type]??[]).includes(s.type));});
 units.forEach((u,i)=>{inc('type:'+u.type);if(reached[i]){inc('reached');inc('reached_type:'+u.type);if(u.importance==='high')inc('reached_high');}});
 const supported=r.statements.map(s=>units.some(u=>{const [a,b]=span(u);return s.provenance.line>=a&&s.provenance.line<=b;}));
 inc('statements_supported',supported.filter(Boolean).length);for(const s of r.statements){inc('stype:'+s.type);inc('typed:'+s.typedness);}
 detail[cat]={statements:r.statements,reachedUnits:units.filter((u,i)=>reached[i]).map(u=>u.id)};}
store.close();
const pub={schema:'pee.r3.translate.v1',label,side,generatedAt:new Date().toISOString(),cues:KT.loadTranslationCues().cues.version,
 tier:side==='dev'?'development sections (the translator is built on them)':'held-out sections (sealed split; inventory sealed before the translator was frozen)',counts:C};
writeFileSync(OUT,JSON.stringify(pub,null,1)+'\n');mkdirSync(join(PE,'r3/runs'),{recursive:true});writeFileSync(join(PE,'r3/runs',`translate-${label}.json`),JSON.stringify({...pub,detail},null,1)+'\n');
const k=Object.keys(C).filter(x=>!x.includes(':')).map(x=>x+'='+C[x]).join(' ');console.log(k);
console.log(Object.keys(C).filter(x=>x.startsWith('type:')).map(x=>x.slice(5)+' '+(C['reached_type:'+x.slice(5)]??0)+'/'+C[x]).join(' | '));
