// N1 (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-n1-authorisation-2026-10-21.md; preregistration evaluation/n1/preregistration.json): relations of teaching tables
// recovered as row claims (src/relation_claims_n1.ts). Synthetic documents only (T1: wiring); the N1 evaluation material
// (development, H1, H2, Q) is never used here. What these tests protect:
//  - a row is not one rigid statement: its columns keep their roles, links follow the table's chain, qualifiers attach to the
//    link they qualify, and nothing is linked only because it shares the row;
//  - every claim carries provenance (document SHA-256, header line, row line, cell hashes) and stays teaching relevance,
//    machine-derived and unreviewed: never establishing, never a ranking input (schema-enforced);
//  - durability (A5): claims rebuild from the immutable document bytes and the mapping version exactly; re-recording is
//    idempotent; a review is journaled with its full content and survives a rebuild; existing relations and assessments
//    are untouched;
//  - retrieval works with and without a known category.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {teachingTablesN1,columnRolesN1,deriveClaimsN1,recordClaimsN1,claimsOfN1,rebuildCheckN1,reviewClaimN1,claimEdges247N1,
 N1_CLAIM_TYPE,N1_EPISTEMIC} from '../src/relation_claims_n1.js';
import {retrieveKnowledgeN1} from '../src/need_interpretation.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const DOC=['# Widgets research','','## Needs atlas','',
 '| ID | Everyday expression | Underlying goal | Relevant attributes | Task-specific measurement | What must not be inferred |',
 '|---|---|---|---|---|---|',
 '| W-01 | My hands hurt when I grip it for long | Comfortable long use | Grip diameter and handle weight | Timed grip test with a force gauge | A soft-touch label does not prove comfort |',
 '| W-02 | It keeps slipping when wet | Secure hold in wet conditions | Wet friction of the handle surface | Wet pull-out force test | |',
 '','## Glossary','','| Term | Meaning |','|---|---|','| Grip | How the hand holds it |','',
 '## Remedies','','| User situation | First action instead of buying | Required verification |','|---|---|---|',
 '| The old one squeaks | Lubricate the joint | Squeak test after lubrication |'].join('\n');
const META={categoryId:'widgets',document:'widgets.md',sha256:sha(DOC)};

test('column roles come from the header vocabulary and identifier values, never from category words', ()=>{
 const [atlas,glossary,remedies]=teachingTablesN1(DOC);
 assert.deepEqual(columnRolesN1(atlas),['identifier','situation','need','property','method','caveat']);
 assert.deepEqual(columnRolesN1(glossary),['other','other']);
 assert.deepEqual(columnRolesN1(remedies),['situation','alternative','method']);
 assert.equal(atlas.headerLine,5);assert.deepEqual(atlas.headings,['Widgets research','Needs atlas']);
});

test('a row claim follows the table chain, attaches qualifiers to the link they qualify and keeps provenance', ()=>{
 const claims=deriveClaimsN1(DOC,META);
 assert.equal(claims.length,3,'two atlas rows and the remedy row; the glossary asserts no relation');
 const w1=claims.find(c=>c.source.line===7)!;
 // the need interprets the situation: no situation -> need link, the situation stays a participant; the trailing caveat
 // qualifies the row's first link
 assert.deepEqual(w1.links,[{from:2,to:3,kind:'relevant_to',qualifiers:[5]},{from:3,to:4,kind:'assessed_by',qualifiers:[]}]);
 assert.ok(w1.participants.some(p=>p.col===1&&p.role==='situation'));
 assert.deepEqual(w1.identifierColumns,[1]);
 assert.equal(w1.claimType,N1_CLAIM_TYPE);assert.equal(w1.epistemic,N1_EPISTEMIC);assert.equal(N1_CLAIM_TYPE,'teaching_relevance');
 assert.equal(w1.source.sha256,META.sha256);assert.equal(w1.source.headerLine,5);
 for(const p of w1.participants)assert.equal(p.textSha256,sha(p.text));
 const w2=claims.find(c=>c.source.line===8)!;
 assert.ok(!w2.participants.some(p=>p.col===5),'an empty cell is not a participant');
 assert.ok(w2.links.every(l=>!l.qualifiers.includes(5)),'no qualifier from an empty cell');
 const r=claims.find(c=>c.source.line===20)!;
 assert.deepEqual(r.links,[{from:0,to:1,kind:'addressed_by',qualifiers:[]},{from:1,to:2,kind:'assessed_by',qualifiers:[]}]);
 for(const c of claims)for(const l of c.links)assert.ok(['relevant_to','addressed_by','assessed_by','qualified_by','alternative_of'].includes(l.kind),'relevance kinds only');
});

test('claims are stored as unreviewed relevance, idempotently, and never as ranking inputs', ()=>{
 const s=new KnowledgeStore246(':memory:');
 const relBefore=s.db.prepare('SELECT COUNT(*) n FROM category_relations').get();const asBefore=s.db.prepare('SELECT COUNT(*) n FROM relation_assessments').get();
 const a=recordClaimsN1(s,{...META,claims:deriveClaimsN1(DOC,META)},{at:'2026-10-21T00:00:00Z'});
 const b=recordClaimsN1(s,{...META,claims:deriveClaimsN1(DOC,META)},{at:'2026-10-21T00:00:00Z'});
 assert.equal(a.recorded,3);assert.equal(b.recorded,0,'re-recording adds nothing');
 assert.equal(claimsOfN1(s,'widgets').length,3);
 assert.throws(()=>s.db.prepare('UPDATE relation_claims_n1 SET ranking_input=1').run(),'schema forbids ranking use');
 assert.throws(()=>s.db.prepare("UPDATE relation_claims_n1 SET claim_type='established'").run(),'schema forbids other claim types');
 assert.deepEqual(s.db.prepare('SELECT COUNT(*) n FROM category_relations').get(),relBefore,'phase247 relations untouched');
 assert.deepEqual(s.db.prepare('SELECT COUNT(*) n FROM relation_assessments').get(),asBefore,'assessments untouched');
 const ev=s.db.prepare("SELECT payload_json FROM events WHERE kind='relation_claims_recorded'").all() as {payload_json:string}[];
 assert.equal(ev.length,2);const p=JSON.parse(ev[0].payload_json);assert.equal(p.sourceSha256,META.sha256);assert.match(p.mapping,/^n1\.1:[0-9a-f]{12}$/);assert.match(p.digest,/^[0-9a-f]{64}$/);
});

test('A5: claims rebuild exactly from the document bytes and the mapping; a review survives the rebuild with its full content', ()=>{
 const s=new KnowledgeStore246(':memory:');
 recordClaimsN1(s,{...META,claims:deriveClaimsN1(DOC,META)},{at:'2026-10-21T00:00:00Z'});
 const id=claimsOfN1(s,'widgets')[0].claimId;
 const receipt={reviewId:'rv1',reviewerId:'owner',reviewedAt:'2026-10-21T01:00:00Z',sourceRevisionIds:[],note:'row read against the source'};
 assert.throws(()=>reviewClaimN1(s,id,receipt,()=>false),/not_verified/);
 reviewClaimN1(s,id,receipt,()=>true);
 const reviewed=claimsOfN1(s,'widgets').find(c=>c.claimId===id)!;
 assert.equal(reviewed.support,'reviewed');assert.equal(reviewed.claimType,'teaching_relevance','a review never makes relevance a result');
 const ok=rebuildCheckN1(s,[{...META,md:DOC}]);
 assert.equal(ok.equal,true,JSON.stringify(ok));assert.equal(ok.reviewsReplayed,1);
 const changed=rebuildCheckN1(s,[{...META,md:DOC.replace('Lubricate the joint','Oil the joint')}]);
 assert.equal(changed.equal,false,'different bytes do not rebuild the stored claims');
 const ev=s.db.prepare("SELECT payload_json FROM events WHERE kind='relation_claim_reviewed'").get() as {payload_json:string};
 assert.deepEqual(JSON.parse(ev.payload_json).receipt,receipt,'the journal carries the whole receipt');
});

test('projection to phase247 edges is only offered where both ends are taught items', ()=>{
 const c=deriveClaimsN1(DOC,META).find(x=>x.source.line===7)!;
 assert.deepEqual(claimEdges247N1(c,()=>null),[],'no aligned ends, no edge');
 const e=claimEdges247N1(c,t=>/force gauge/.test(t)?'item:cat_aaaaaaaaaaaaaaaaaaaa':/Grip diameter/.test(t)?'item:cat_bbbbbbbbbbbbbbbbbbbb':null);
 // phase247 direction: measured_by runs from the measurement to what it measures; relevant_to has no phase247 slot
 assert.deepEqual(e,[{from:'item:cat_aaaaaaaaaaaaaaaaaaaa',to:'item:cat_bbbbbbbbbbbbbbbbbbbb',kind:'measured_by',support:'hypothesis',qualifierColumns:[]}]);
});

test('retrieval finds claims for a new situation with or without the category, and states its basis', ()=>{
 const s=new KnowledgeStore246(':memory:');recordClaimsN1(s,{...META,claims:deriveClaimsN1(DOC,META)},{at:'2026-10-21T00:00:00Z'});
 for(const categoryId of ['widgets',null]){
  const r=retrieveKnowledgeN1(s,'my hands start to hurt after I grip the thing for an hour',{categoryId,source:'claims',k:5});
  assert.ok(r.length>=1);assert.equal(r[0].ref.startsWith('clm_'),true);assert.equal(r[0].categoryId,'widgets');
  assert.ok(r[0].text.includes('Comfortable long use'));assert.ok(r[0].shared.length>=2);}
 assert.deepEqual(retrieveKnowledgeN1(s,'the weather is nice today',{categoryId:null,source:'claims',k:5}),[]);
});

test('the claims option changes only the experimental need interpretation, and labels what it adds as recovered', async ()=>{
 const {applyTeaching252,registerTeachingSources252}=await import('../src/phase252_category_teaching.js');
 const {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271}=await import('../src/phase271_category_teaching.js');
 const {adviseFromRequest253}=await import('../src/phase253_request_advice.js');
 const {CATEGORY_REGISTRY250}=await import('../src/phase248_category_registry.js');
 const {loadQuantityKnowledge}=await import('../src/quantity_knowledge.js');
 const qk=loadQuantityKnowledge();const s=new KnowledgeStore246(':memory:');registerTeachingSources252(SOURCES271);
 applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
 const doc=['# Bedroom use','','| User situation | Underlying goal | Relevant attributes |','|---|---|---|',
  '| My partner wakes up at the slightest hum in the bedroom | Quiet operation during sleep | Low-mode noise with clean-air delivery |'].join('\n');
 recordClaimsN1(s,{categoryId:'air_purifiers',document:'synthetic-n1.md',sha256:sha(doc),claims:deriveClaimsN1(doc,{categoryId:'air_purifiers',document:'synthetic-n1.md',sha256:sha(doc)})},{at:'2026-10-21T00:00:00Z'});
 const t='I need an air purifier, my partner wakes up at the slightest hum.';
 const ask=(claims:boolean)=>adviseFromRequest253(t,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:{knowledgeGuided:true,claims}});
 const off=ask(false),on=ask(true);
 const decision=(a:typeof off)=>JSON.stringify([a.response,a.category,a.needs,a.constraints,a.excluded,a.shortlist,a.statements,a.questions,a.unassessedObjectives,a.ranked??null]);
 assert.equal(decision(off),decision(on),'recovered relations never change the answer');
 for(const i of on.needInterpretation!.inferred){assert.equal(i.state,'experimental_unverified');
  if(i.provenance==='recovered_relation')assert.ok(i.path.some(p=>p.some(x=>x.step==='statement'&&/^clm_/.test(x.ref))),'the path names the claim');}
 assert.ok(off.needInterpretation!.inferred.every(i=>i.provenance!=='recovered_relation'),'off: nothing recovered is used');
});
