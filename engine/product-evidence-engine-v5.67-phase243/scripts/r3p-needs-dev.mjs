#!/usr/bin/env node
/** R3-P stage 2 DEVELOPMENT measure (spent material only: Phase269 teaching set, Phase270 generalisation set, Phase271
 * cross set; their outcome labels were written in those phases). Arms A (switch off) and B (switch on), and C-lite effects
 * (shadow), on one build. Counts only, printed; never a held-out result.
 *   node scripts/r3p-needs-dev.mjs [--candidates FILE] */
import {readFileSync,copyFileSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const D=new URL('../dist/src/',import.meta.url).pathname;
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const QK=await import(D+'quantity_knowledge.js');const KR=await import(D+'knowledge_rules.js');
const E=new URL('../evaluation/',import.meta.url).pathname;const J=f=>JSON.parse(readFileSync(E+f,'utf8'));
const cases=[...J('phase269/teaching-eval-set.json').development,...J('phase269/teaching-eval-set.json').untouched,...J('phase270/gen-eval-set.json').untouched,
 ...J('phase271/cross-eval-set.json').development,...J('phase271/cross-eval-set.json').untouched];
const dir=join(homedir(),'.cache-r3p');mkdirSync(dir,{recursive:true});copyFileSync(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'),join(dir,'dev.sqlite'));
const store=new KnowledgeStore246(join(dir,'dev.sqlite'));const qk=QK.loadQuantityKnowledge();
const ci=process.argv.indexOf('--candidates');const cand=ci>0?KR.compileRuleSet(JSON.parse(readFileSync(process.argv[ci+1],'utf8'))).get('need_candidates'):null;
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const verbose=process.argv.includes('--verbose');
for(const c of cases){const gold=new Set(c.outcomes??[]);inc('cases');inc('gold',gold.size);
 for(const arm of ['A','B']){const a=adviseFromRequest253(c.text,store,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-20',needInterpretation:{knowledgeGuided:arm==='B',candidates:arm==='B'?cand:null}});
  const ni=a.needInterpretation;const found=new Set([...ni.expressed.map(e=>e.concept),...ni.inferred.map(i=>i.concept)]);
  for(const g of gold)inc(`${arm}:gold_found`,found.has(g)?1:0);for(const f of found)if(!gold.has(f))inc(`${arm}:extra`);
  inc(`${arm}:inferred`,ni.inferred.length);inc(`${arm}:inferred_correct`,ni.inferred.filter(i=>gold.has(i.concept)).length);
  inc(`${arm}:uninterpreted_clauses`,ni.trace.filter(t=>t.status==='uninterpreted').length);
  if(arm==='B'&&ni.candidateEffects){inc('C:candidate_effects',ni.candidateEffects.length);inc('C:candidate_correct',ni.candidateEffects.filter(e=>gold.has(e.concept)).length);}
  if(verbose&&arm==='B'&&(ni.inferred.length||ni.candidateEffects?.length))console.log(c.id,[...gold],'| inferred',ni.inferred.map(i=>i.concept+'('+i.support+':'+i.anchors.join('+')+')'),'| cand',(ni.candidateEffects??[]).map(e=>e.concept));}}
console.log(JSON.stringify(T,null,1));
