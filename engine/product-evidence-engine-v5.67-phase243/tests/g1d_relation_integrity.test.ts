// G1d (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-g1d-authorisation-2026-10-21.md; preregistration evaluation/g1d/preregistration.json).
// What these tests protect (synthetic package material, wiring only; no embedder: the action term decides alone):
//  - a relation exists only where a source clause ASSERTS the strategy's action; shared words (co-mention) never link;
//  - every relation keeps polarity, condition, quote, header, the source's own epistemic label and provenance;
//    nothing is promoted ('derived_unreviewed');
//  - rows are re-read from the source with every cell (the cells G1b dropped);
//  - owner rule on category applicability: essential incompatibility -> unsuitable, never proposed as suitable;
//    modifiable condition -> conditional possibility; no consumer situation -> not a purchase situation;
//  - selection: a question only between competing verified situations; missing knowledge -> research, never a question;
//    the fused ranking of the retrievers is exposed separately from the vector ranking.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {DEHUMIDIFIER_TEACHING271} from '../src/phase270_teaching.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {buildProjectionG1b,type KnowledgeDocG1b} from '../src/situation_knowledge_g1b.js';
import {sourceRowsG1d,deriveRelationsG1d,strategyActionsG1d,categoryApplicabilityG1d,type RelationG1d,type CategoryRelationG1d} from '../src/relation_integrity_g1d.js';
import {verifiedSelectionG1d,G1D_SELECTION_PARAMS} from '../src/verified_retrieval_g1d.js';
import {SemanticIndexG1c,knowledgeUnitsG1c} from '../src/semantic_retrieval_g1c.js';
import {stemsNI} from '../src/need_interpretation.js';
import type {EmbedderG1c} from '../src/semantic_embedding_g1c.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();registerTeachingSources252(SOURCES271);
const S=new KnowledgeStore246(':memory:');applyTeaching252(S,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,DEHUMIDIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
const DOCS:KnowledgeDocG1b[]=[{path:'synthetic/purifier.md',category:'air_purifiers',text:['## 3. Consumer needs (PROPOSED)','',
 '| Everyday expression | Underlying goal | Relevant solution | Hard-stop / explanation |','|---|---|---|---|',
 '| “The kitchen stays smoky after frying” | Remove cooking fumes | Ducted extractor venting outdoors first; purifier only as adjunct if indicated | A purifier is not a substitute for exterior-venting extraction |',
 '| “I worry about CO2 in the bedroom” | Real ventilation | Outdoor-air ventilation and a genuine CO2 sensor | A purifier is not a CO2-removal solution |',
 '| “Pollen makes me sneeze” | Remove airborne particles | Clean air delivery rate in the room | Filter replacement cost |',
 '| “The filter leak risk worries me” | Avoid bypass | Sealed filter frame | Check gasket |'].join('\n')},
 {path:'synthetic/dish.md',category:'dishwashers',text:['## Water fill','',
  '| Synthetic user language | Underlying goal | Relevant solution | Evidence or conditional rejection trigger |','|---|---|---|---|',
  '| “Water pressure is poor in my flat” | Fill water reliably | Check inlet pressure thresholds or tank-fed alternatives | Model inlet pressure incompatible, with no safe reservoir mode |'].join('\n')},
 {path:'synthetic/food.md',category:'air_fryers',text:['## Foods','','| Food | Outcome | Measurement |','|---|---|---|','| Raw cut potatoes | Crisp surface | Browning score |'].join('\n')}];
const P=buildProjectionG1b(S,DOCS,qk);
const advise=(t:string)=>adviseFromRequest253(t,S,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
const catTerms=(c:string)=>{const e=CATEGORY_REGISTRY250.find(x=>x.id===c);return [c.replace(/_/g,' '),...((e as {aliases?:string[]}|undefined)?.aliases??[])];};
const rowOf=(re:RegExp)=>{const r=P.rows.find(x=>re.test(x.expression));if(!r)throw Error('no row '+re+': '+JSON.stringify(P.rows.filter(x=>x.kind!=='store_concept').map(x=>x.expression.slice(0,50))));return r;};

test('source rows: every cell is re-read with its header and role, with the source label', ()=>{
 const src=sourceRowsG1d(P,DOCS);const r=src.get(rowOf(/smoky after frying/).id)!;
 assert.equal(r.complete,true);assert.ok(r.cells.length>=4,'all cells kept');assert.ok(r.cells.some(c=>/Ducted extractor/.test(c.text)));
 assert.match(String(r.sourceStatus),/PROPOSED/);
});

test('relations: only asserted actions link; co-mention never does; each keeps polarity, quote and provenance', async()=>{
 const src=sourceRowsG1d(P,DOCS);const rels=await deriveRelationsG1d(src,P.strategies,null);
 const of=(re:RegExp)=>rels.filter(r=>r.rowId===rowOf(re).id).map(r=>r.strategy);
 assert.ok(of(/smoky after frying/).includes('strategy:cooker_extraction_alternative'),'the source asserts ducted extraction');
 // known limit of the frozen r1.3 (reported in docs/plans/g1d-report.md): after hyphen splitting the ventilation strategy keeps only
 // a common term, so outdoor-air ventilation is not linked; no assertion encodes that defect as desired behaviour
 assert.ok(!of(/leak risk/).includes('strategy:leak_or_structural_alternative'),'"leak risk" of a filter is not a building leak');
 assert.equal(of(/Pollen/).length,0);
 for(const r of rels){assert.equal(r.status,'derived_unreviewed');assert.ok(r.quote&&r.header!==undefined&&r.provenance.document);assert.match(r.quoteSha256,/^[0-9a-f]{64}$/);}
 const cond=rels.find(r=>r.rowId===rowOf(/Water pressure/).id&&r.strategy==='strategy:cannot_plumb_constraint');
 if(cond)assert.equal(cond.polarity,'conditional','"Check ... or tank alternatives" is conditional');
 const acts=strategyActionsG1d(P.strategies);assert.ok(acts.every(a=>!/\(/.test(a.action)),'asides are not part of an action');
});

test('owner rule: essential incompatibility -> unsuitable; modifiable -> conditional; no situation -> not a purchase situation', ()=>{
 const src=sourceRowsG1d(P,DOCS);
 const co2=categoryApplicabilityG1d(src.get(rowOf(/CO2 in the bedroom/).id)!,catTerms('air_purifiers'));
 assert.equal(co2.value,'unsuitable');assert.equal(co2.conditionKind,'essential');assert.ok(co2.quote);
 // known limit of r1.3: 'is not a substitute for <action>' is not read as an incompatibility (reported)
 const food=categoryApplicabilityG1d(src.get(rowOf(/Crisp surface/).id)!,catTerms('air_fryers'));
 assert.equal(food.value,'not_a_purchase_situation');
});

/** Deterministic stand-in embedder: hashed stems (wiring only). */
const fake:EmbedderG1c={modelId:'fake',modelRevision:'1',dim:128,async embed(ts){return ts.map(t=>{const v=new Float32Array(128);
 for(const s of stemsNI(t)){const h=createHash('sha256').update(s).digest();v[h[0]%128]+=1;}let n=0;for(const x of v)n+=x*x;n=Math.sqrt(n)||1;return v.map(x=>x/n);});}};

test('selection: fused ranking exposed; essential incompatibility never proposed; unknown -> research, not a question', async()=>{
 const ix=new SemanticIndexG1c(fake);await ix.add(knowledgeUnitsG1c(P,{store:S}));
 const src=sourceRowsG1d(P,DOCS);const rels=await deriveRelationsG1d(src,P.strategies,null);
 const relations=new Map<string,RelationG1d[]>();for(const r of rels)(relations.get(r.rowId)??relations.set(r.rowId,[]).get(r.rowId)!).push(r);
 const categories=new Map<string,CategoryRelationG1d>([...src.values()].map(r=>[r.rowId,categoryApplicabilityG1d(r,catTerms(r.category))]));
 const ctx={P,index:ix,qk,relations,categories};const old=G1D_SELECTION_PARAMS.minRowSim;G1D_SELECTION_PARAMS.minRowSim=0.2;
 try{
  const t='I worry about CO2 in the bedroom at night.';const a=advise(t);const before=JSON.stringify(a);
  const x=await verifiedSelectionG1d(t,a,S,ctx);
  assert.ok(x.retrieval.fused.length&&x.retrieval.vector.length,'both rankings exposed');
  assert.equal(JSON.stringify(a),before,'shadow: the advice is unchanged');
  // the owner rule as a mechanism: a category whose verified situations document an essential incompatibility is never proposed
  const essential=new Map([...categories].map(([k,c])=>[k,c.category==='air_purifiers'&&c.value!=='not_a_purchase_situation'?{...c,value:'unsuitable' as const,conditionKind:'essential' as const,condition:'documented incompatibility'}:c]));
  const z=await verifiedSelectionG1d(t,a,S,{...ctx,categories:essential});
  assert.ok(!z.proposals.some(p=>p.category==='air_purifiers'),'an essential incompatibility is never proposed');
  if(z.verified.some(v=>v.category==='air_purifiers'&&v.counts)&&!z.competing.length)assert.ok(z.notSuitable.some(n=>n.category==='air_purifiers'),'and it is stated as not suitable');
  // a modifiable condition is a conditional possibility, never a suitable hypothesis
  const modifiable=new Map([...categories].map(([k,c])=>[k,c.value!=='not_a_purchase_situation'?{...c,value:'conditional' as const,conditionKind:'modifiable' as const,condition:'check first'}:c]));
  const m=await verifiedSelectionG1d(t,a,S,{...ctx,categories:modifiable});
  for(const p of m.proposals)if(p.kind==='purchase'&&p.category!==m.named)assert.equal(p.status,'conditional_possibility');
 }finally{G1D_SELECTION_PARAMS.minRowSim=old;}
 // at the registered threshold, a request outside the knowledge gets research or abstention, never a question
 const u='My bicycle chain keeps slipping on hills.';const y=await verifiedSelectionG1d(u,advise(u),S,ctx);
 assert.equal(y.question,null,'no question when knowledge is missing');assert.ok(['research','abstain'].includes(y.action),y.action);
});
