import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {runJourney248} from '../src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {LEXICAL_L252,RESEARCH_GUIDED_G252,TEACHING_SOURCES252,TEACHING_BUDGET252,applyTeaching252,registryWithTeaching252,lessonOf252,phraseCount252} from '../src/phase252_category_teaching.js';
import {decideAdvice249,type Candidate249} from '../src/phase249_decision.js';
import {createDecision177,applyDecisionAction177} from '../src/phase177_decision_snapshot.js';
// Phase252 T1 tests for proactive teaching. Requests are synthetic fixtures written by the developer, not evaluation data.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee252t-'));const AT='2026-10-16T12:00:00.000Z';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class',classPolicy:FACTUAL_CLASS_POLICY249};
const store=()=>new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'),CLASS);

test('the lexical and research-guided arms use the same names and the same phrase budget; every cited source exists',()=>{
 for(const t of RESEARCH_GUIDED_G252){const l=LEXICAL_L252.find(x=>x.categoryId===t.categoryId)!;
  assert.deepEqual([...t.registry.aliases].sort(),[...l.registry!.aliases!].sort());
  assert.ok(phraseCount252(lessonOf252(t))<=phraseCount252(l));
  assert.ok(t.needs.length<=TEACHING_BUDGET252.needs&&t.registry.partPhrases.length<=TEACHING_BUDGET252.counterexamples);
  const all=[...t.subtypes,...t.mechanisms,...t.interpretation,...t.applicability,...t.gaps,...t.needs.flatMap(n=>[n.outcome,n.requirement?.why,...(n.proxies??[]).map(p=>p.note)].filter(Boolean))];
  for(const x of all)for(const s of x!.sources)assert.ok(TEACHING_SOURCES252.some(y=>y.id===s),s);
  for(const x of all)if(x!.basis!=='instructor_hypothesis')assert.ok(x!.sources.length,'a sourced basis needs a source: '+x!.text);
 }
});
test('teaching compiles into store items and hypothesis relations only, idempotently',()=>{
 const s=store();const a=applyTeaching252(s,RESEARCH_GUIDED_G252,AT);const b=applyTeaching252(s,RESEARCH_GUIDED_G252,AT);
 assert.ok(a.items>0&&a.relations>0);assert.equal(b.items+b.relations+b.itemsAdded,0);
 const rels=s.db.prepare("SELECT kind,support FROM category_relations WHERE category_id IN ('microwave_ovens','headphones')").all() as {kind:string;support:string}[];
 assert.ok(rels.every(r=>r.support==='hypothesis'));assert.ok(rels.some(r=>r.kind==='not_sufficient_for'));
 assert.ok((s.db.prepare("SELECT knowledge_class k FROM category_items WHERE category_id='headphones'").all() as {k:string}[]).every(r=>r.k==='technical_hypothesis'));
 s.close();
});
test('a taught need yields its requirement, its question, the misleading proxies and the missing evidence',()=>{
 const s=store();applyTeaching252(s,RESEARCH_GUIDED_G252,AT);const reg=registryWithTeaching252(CATEGORY_REGISTRY250,RESEARCH_GUIDED_G252);
 const j=runJourney248('Looking for a microwave, our food always ends up cold in the middle',s,reg);
 assert.equal(j.stages.category.categoryId,'microwave_ovens');
 assert.deepEqual(j.stages.need.concepts.map(c=>c.id),['even_heating']);
 assert.ok(j.stages.requirements.cautions.some(c=>c.attribute==='microwave power'&&c.kind==='not_sufficient_for'));
 assert.ok(j.researchPlan.some(p=>p.startsWith('missing evidence for even_heating')));
 const h=runJourney248('wireless headphones that last a whole flight',s,reg);
 assert.ok(h.stages.requirements.factualRequirements.some(f=>f.criterion==='battery_life_min'));
 assert.ok(h.clarificationQuestions.some(q=>/hours of listening/.test(q)));
 assert.notEqual(runJourney248('ear pads for my headphones',s,reg).stages.category.categoryId,'headphones');
 s.close();
});
test('an "up to" battery declaration below the need excludes; above it, it stays unknown',()=>{
 let snap=applyDecisionAction177(createDecision177('t'),{type:'set_scope',source:'user_web_control',scope:{category:'headphones',task:'product_selection'}}).snapshot;
 snap=applyDecisionAction177(snap,{type:'set_criterion',source:'user_web_control',key:'battery_life_min',label:'Long flights',value:{kind:'quantity',value:20,unit:'h'},priority:'hard'}).snapshot;
 const d=(id:string,raw:string,n:number,bound?:'max')=>({declarationId:id,property:'Battery Life',value:{kind:'quantity',number:n,unit:'h',approximate:false,...(bound?{bound}:{})} as never,rawValue:raw,evidenceRole:'manufacturer_declaration',sourceUrl:'https://m.example/'+id,variantId:null});
 const C:Candidate249[]=[{productId:'a',name:'A',declarations:[d('a','Up to 12 hours',12,'max')]},{productId:'b',name:'B',declarations:[d('b','Up to 30 hours',30,'max')]},{productId:'c',name:'C',declarations:[d('c','24 h',24)]}];
 const a=decideAdvice249({snapshot:snap,candidates:C});
 const o=(id:string)=>a.checks.find(c=>c.productId===id)!.outcome;
 assert.equal(o('a'),'fails');assert.equal(o('b'),'unknown');assert.equal(o('c'),'meets_all');
});
test('development after the first run: indifference removes a need, a wanted absence keeps it; a singular names a plural category',()=>{
 const s=store();applyTeaching252(s,RESEARCH_GUIDED_G252,AT);const reg=registryWithTeaching252(CATEGORY_REGISTRY250,RESEARCH_GUIDED_G252);
 const ids=(q:string)=>runJourney248(q,s,reg).stages.need.concepts.map(c=>c.id);
 assert.ok(!ids('Wired headphones, I am not bothered about noise cancelling').includes('noise_cancelling'));
 assert.ok(!ids('headphones for the office, ANC doesn\'t matter to me').includes('noise_cancelling'));
 assert.ok(ids('headphones with noise cancelling for my commute').includes('noise_cancelling'));
 assert.ok(ids('a microwave without cold spots, I hate cold in the middle').includes('even_heating'));
 assert.equal(runJourney248('which wireless earbud is best for the gym',s,reg).stages.category.categoryId,'headphones');
 s.close();
});
