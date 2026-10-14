import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {auditFieldArguments188,type ArgumentLedger188,type Argument188,type SignedArgumentLedger188} from '../src/phase188_evidence_argument_audit.js';
import type {FieldCatalog187,FieldGoal187,SignedFieldCatalog187,FieldObservation187} from '../src/phase187_field_evidence_bridge.js';

// Entire corpus is synthetic. Ed25519 keys are TEST-ONLY; no real expert review or product verdict.
const keys=generateKeyPairSync('ed25519');
const publicKey=keys.publicKey.export({type:'spki',format:'pem'}).toString();
const authority={market:'us',asOf:'2026-10-12T12:00:00Z',publicKeys:{fictional_reviewer:publicKey}};
const h='a'.repeat(64),h2='b'.repeat(64),h3='c'.repeat(64);
const policy={id:'room_cadr',kind:'numeric_minimum' as const,dimension:'smoke_cadr',unit:'cfm',
 protocolId:'ac1',protocolVersion:'v1',threshold:150,thresholdMax:null,claim:null,
 profileId:'bedroom_a',comparison:'no_order' as const,acceptedForFit:['certified_or_verified_register','independent_professional_test'] as const,
 reviewReference:'test_reviewer',reviewedApplicability:'Fictional bedroom requirement; not certified for a real room.'};
function observation(id:string,variantId:string,value:number,sourceClass:FieldObservation187['sourceClass']):FieldObservation187{
 return {id,variantId,dimension:'smoke_cadr',value,unit:'cfm',protocolId:'ac1',protocolVersion:'v1',sourceClass,
  sourceUrl:`https://example.org/${variantId}/${id}`,originalSha256:h,originalLocator:`row.${id}`,
  sourceRightsReference:'rights_test',identityReviewReference:'identity_test',derivedFrom:null};
}
const goal:FieldGoal187={market:'us',category:'air_cleaner',profileId:'bedroom_a',confirmedByUser:true};
function catalog():FieldCatalog187{return {phase:187,schema:'187.1',market:'us',category:'air_cleaner',revision:'cat_a',
 reviewedAt:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',externalReviewer:'fictional_reviewer',
 rightsAuditReference:'rights_test',coverageStatement:'Fictional partial catalogue for test purposes only.',marketCoverageComplete:false,
 policies:[policy],variants:[
 {id:'a',name:'Fictional Air Cleaner A',observations:[observation('oa','a',180,'certified_or_verified_register')]},
 {id:'b',name:'Fictional Air Cleaner B',observations:[observation('ob','b',160,'manufacturer_specification')]},
 {id:'c',name:'Fictional Air Cleaner C',observations:[observation('oc','c',110,'certified_or_verified_register')]},
 {id:'d',name:'Fictional Air Cleaner D',observations:[]} ]};}
const csign=(c:FieldCatalog187):SignedFieldCatalog187=>({catalog:c,keyId:'fictional_reviewer',
 signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')});
const esign=(l:ArgumentLedger188):SignedArgumentLedger188=>({ledger:l,keyId:'fictional_reviewer',
 signatureBase64:sign(null,Buffer.from(canonicalJson180(l)),keys.privateKey).toString('base64')});
function measured(id:string,variantId:string,observationId:string,kind:Argument188['kind'],stance:Argument188['stance']):Argument188{
 return {id,claimId:`claim_${variantId}`,variantId,fieldId:'smoke_cadr',stance,kind,sourceGroupId:`source_${id}`,
  rootSourceId:`root_${id}`,sourceUrl:`https://example.org/${variantId}/${observationId}`,
  originalSha256:h,originalLocator:`row.${observationId}`,methodReference:'reviewer_test',
  context:'Fictional original test record, not scientific evidence.',observationId,derivedFrom:[]};}
function qualitative(id:string,variantId='a',stance:Argument188['stance']='against'):Argument188{
 return {id,claimId:`claim_${variantId}`,variantId,fieldId:'smoke_cadr',stance,kind:'structured_expert_observation',
  sourceGroupId:`source_${id}`,rootSourceId:`root_${id}`,sourceUrl:`https://example.org/field/${id}`,
  originalSha256:h2,originalLocator:`section.${id}`,methodReference:'fictional_field_rubric',
  context:'Observed handling issue in a fictional context of use.',observationId:null,derivedFrom:[]};}
function ledger():ArgumentLedger188{return {phase:188,schema:'188.1',market:'us',category:'air_cleaner',
 revision:'audit_a',fieldCatalogRevision:'cat_a',reviewedAt:'2026-10-11T00:00:00Z',
 expiresAt:'2026-10-30T00:00:00Z',reviewReference:'review_a',rightsReference:'rights_a',reviewer:'fictional_reviewer',
 coverageStatement:'Partial invented arguments, not complete professional product reviews.',
 claims:[{id:'claim_a',variantId:'a',fieldId:'smoke_cadr',useProfileId:'bedroom_a',statement:'The sample unit A meets this one fictional CADR condition.'},
 {id:'claim_b',variantId:'b',fieldId:'smoke_cadr',useProfileId:'bedroom_a',statement:'The sample unit B meets this one fictional CADR condition.'},
 {id:'claim_c',variantId:'c',fieldId:'smoke_cadr',useProfileId:'bedroom_a',statement:'The sample unit C meets this one fictional CADR condition.'},
 {id:'claim_d',variantId:'d',fieldId:'smoke_cadr',useProfileId:'bedroom_a',statement:'The sample unit D meets this one fictional CADR condition.'}],
 arguments:[measured('a_measured','a','oa','certified_measurement','for'),
 measured('b_measured','b','ob','manufacturer_specification','for'),
 measured('c_measured','c','oc','certified_measurement','against')]};}
function run(c=catalog(),l=ledger(),g=goal,a=authority){return auditFieldArguments188({goal:g,catalog:csign(c),ledger:esign(l),authority:a});}
const byId=(r:ReturnType<typeof run>,id:string)=>r.claims.find(x=>x.claimId===id)!;
const rejected=(r:ReturnType<typeof run>)=>assert.equal(r.status,'research_required');

test('four claim states use phase187 field outcome, no new ranking',()=>{
 const r=run();assert.equal(r.status,'audited');assert.equal(byId(r,'claim_a').state,'limited_field_support');
 assert.equal(byId(r,'claim_b').state,'provisional');assert.equal(byId(r,'claim_c').state,'field_inadequate');
 assert.equal(byId(r,'claim_d').state,'undetermined');assert.equal(r.noGeneralProductRanking,true);
 assert.equal(r.noProbabilityEstimates,true);assert.equal(r.noAutomaticEvidenceAdmission,true);
 assert.equal(r.fieldDecision.ordered.length,0);
});
test('editorial interpretation of original test is not another independent experiment',()=>{
 const l=ledger(),original=l.arguments[0];
 const duplicate:Argument188={...original,id:'editorial_a',kind:'editorial_inference',observationId:null,
 sourceUrl:'https://example.org/articles/derived',originalSha256:h2,originalLocator:'p.5',derivedFrom:[original.id]};
 l.arguments=[...l.arguments,duplicate];const r=run(catalog(),l);
 assert.equal(byId(r,'claim_a').reviewerDeclaredSourceGroups,1);
 assert.equal(byId(r,'claim_a').duplicateOrDerivedArguments,1);
 assert.deepEqual(byId(r,'claim_a').editorialInterpretations,['editorial_a']);
});
test('three copied presentations of one experiment do not become four tests',()=>{
 const l=ledger(),orig=l.arguments[0];
 l.arguments=[...l.arguments,...['x','y','z'].map((s,i)=>({...orig,id:`editorial_${s}`,kind:'editorial_inference' as const,
 observationId:null,sourceUrl:`https://example.org/republisher/${s}`,
 originalSha256:[h2,h3,'d'.repeat(64)][i],originalLocator:`p.${i}`,derivedFrom:[orig.id]}))];
 const r=run(catalog(),l);assert.equal(byId(r,'claim_a').reviewerDeclaredSourceGroups,1);
 assert.equal(byId(r,'claim_a').duplicateOrDerivedArguments,3);
});
test('independent structured expert criticism creates contest, not mathematical 50/50 score',()=>{
 const l=ledger();l.arguments=[...l.arguments,qualitative('stair_problem')];const r=run(catalog(),l);
 assert.equal(byId(r,'claim_a').state,'contested');assert.equal(byId(r,'claim_a').supportingRootGroups.length,1);
 assert.equal(byId(r,'claim_a').challengingRootGroups.length,1);
 assert.equal(byId(r,'claim_a').researchGaps.length,1);
 assert.equal(r.fieldDecision.compatible[0].variantId,'a');
});
test('standalone expert impression cannot certify numeric specification',()=>{
 const l=ledger();l.arguments=[qualitative('report_a','a','for')];
 const r=run(catalog(),l);assert.equal(byId(r,'claim_a').state,'provisional');
});
test('manufacturer technical match stays provisional without global credibility weights',()=>{
 const r=run();assert.equal(byId(r,'claim_b').state,'provisional');assert.equal(r.fieldDecision.provisional[0].variantId,'b');
});
test('absence of information never counts as a negative product measurement',()=>{
 const r=run();assert.equal(byId(r,'claim_d').state,'undetermined');assert.equal(r.fieldDecision.held.some(x=>x.variantId==='d'),true);
});
test('a field measurement in another variant cannot support this claim',()=>{
 const l=ledger();l.arguments=[{...l.arguments[0],variantId:'b'},...l.arguments.slice(1)];rejected(run(catalog(),l));
});
test('a missing or swapped exact observation is rejected',()=>{
 const l=ledger();l.arguments=[{...l.arguments[0],observationId:'ob'},...l.arguments.slice(1)];rejected(run(catalog(),l));
});
test('a changed original document hash is rejected against signed catalog',()=>{
 const l=ledger();l.arguments=[{...l.arguments[0],originalSha256:h3},...l.arguments.slice(1)];rejected(run(catalog(),l));
});
test('a changed source URL is rejected against signed catalog',()=>{
 const l=ledger();l.arguments=[{...l.arguments[0],sourceUrl:'https://example.org/other'},...l.arguments.slice(1)];rejected(run(catalog(),l));
});
test('a mismatched original locator is rejected',()=>{
 const l=ledger();l.arguments=[{...l.arguments[0],originalLocator:'row.new'},...l.arguments.slice(1)];rejected(run(catalog(),l));
});
test('numeric argument cannot impersonate stronger source class',()=>{
 const l=ledger();l.arguments=[{...l.arguments[1],kind:'independent_measurement'},...l.arguments.filter((_,i)=>i!==1)];
 rejected(run(catalog(),l));
});
test('false positive stance contradicting observed threshold is rejected',()=>{
 const l=ledger();l.arguments=[{...l.arguments[2],stance:'for'},...l.arguments.slice(0,2)];rejected(run(catalog(),l));
});
test('false negative stance contradicting observed threshold is rejected',()=>{
 const l=ledger();l.arguments=[{...l.arguments[0],stance:'against'},...l.arguments.slice(1)];rejected(run(catalog(),l));
});
test('same observation cannot be recast as two independent experiments',()=>{
 const l=ledger();l.arguments=[...l.arguments,{...l.arguments[0],id:'second_a',sourceGroupId:'fake_second',rootSourceId:'fake_root'}];
 rejected(run(catalog(),l));
});
test('one claimed root cannot split into two source groups',()=>{
 const l=ledger();l.arguments=[...l.arguments,{...qualitative('a_qual'),rootSourceId:'root_a_measured'}];
 rejected(run(catalog(),l));
});
test('one source group cannot join unrelated root experiments',()=>{
 const l=ledger();l.arguments=[...l.arguments,{...qualitative('a_qual'),sourceGroupId:'source_a_measured'}];
 rejected(run(catalog(),l));
});
test('editorial claims must derive from a documented premise',()=>{
 const l=ledger();l.arguments=[...l.arguments,{...qualitative('x'),kind:'editorial_inference'}];rejected(run(catalog(),l));
});
test('cycle of derived editorial statements is rejected',()=>{
 const l=ledger();l.arguments=[...l.arguments,
 {...qualitative('a_qa'),kind:'editorial_inference',sourceGroupId:'source_a_measured',rootSourceId:'root_a_measured',derivedFrom:['a_qb']},
 {...qualitative('a_qb'),kind:'editorial_inference',sourceGroupId:'source_a_measured',rootSourceId:'root_a_measured',derivedFrom:['a_qa']}];
 rejected(run(catalog(),l));
});
test('derived argument cannot borrow another product or original study',()=>{
 const l=ledger();l.arguments=[...l.arguments,{...qualitative('a_q'),kind:'editorial_inference',derivedFrom:['b_measured']}];
 rejected(run(catalog(),l));
});
test('signed ledger tampering is blocked',()=>{
 const l=esign(ledger());l.ledger.claims[0].statement='Unreviewed proof altered in flight.';
 rejected(auditFieldArguments188({goal,catalog:csign(catalog()),ledger:l,authority}));
});
test('catalog tampering is blocked even if ledger remains signed',()=>{
 const c=csign(catalog());c.catalog.variants[0].name='Forgery!';
 rejected(auditFieldArguments188({goal,catalog:c,ledger:esign(ledger()),authority}));
});
test('unknown signer key cannot self-authorize arguments',()=>{
 const e=esign(ledger());e.keyId='unknown_key';rejected(auditFieldArguments188({goal,catalog:csign(catalog()),ledger:e,authority}));
});
test('phase187 knowledge revision changes invalidate old arguments',()=>{
 const c=catalog();c.revision='new_cat_revision';rejected(run(c,ledger()));
});
test('expired argument review is withheld',()=>{
 const a={...authority,asOf:'2026-10-31T10:00:00Z'};rejected(run(catalog(),ledger(),goal,a));
});
test('review dated before the field knowledge cannot authorize an audit',()=>{
 const l=ledger();l.reviewedAt='2026-09-20T00:00:00Z';rejected(run(catalog(),l));
});
test('unreviewed usage profile does not get a borrowed argument graph',()=>{
 const d=run(catalog(),ledger(),{...goal,profileId:'different'});rejected(d);
});
test('market and category must remain exactly bound to source review',()=>{
 const l=ledger();l.category='water_filter';rejected(run(catalog(),l));
});
test('unconfirmed shopping request cannot use graph as an alternative approval path',()=>{
 assert.throws(()=>run(catalog(),ledger(),{...goal,confirmedByUser:false as true}),/bad187_request/);
});
test('claims cannot come from a different variant',()=>{
 const l=ledger();l.claims[0].variantId='nonexistent_product';rejected(run(catalog(),l));
});
test('qualitative observation cannot impersonate measured observation ID',()=>{
 const l=ledger();l.arguments=[...l.arguments,{...qualitative('a_qual'),observationId:'oa'}];rejected(run(catalog(),l));
});
test('reordering reviewed independent arguments does not change conclusion',()=>{
 const l=ledger();const a=run(catalog(),l);l.arguments=[...l.arguments].reverse();const b=run(catalog(),l);
 assert.deepEqual(a.claims,b.claims);
});
test('supplementary non-voting editorial cannot flip original field decision',()=>{
 const l=ledger();const original=l.arguments[0];l.arguments=[...l.arguments,{...original,id:'e_weak',kind:'editorial_inference',
 observationId:null,stance:'against',sourceUrl:'https://example.org/summary',originalSha256:h2,originalLocator:'paragraph.6',derivedFrom:[original.id]}];
 const r=run(catalog(),l);assert.equal(byId(r,'claim_a').state,'limited_field_support');
 assert.equal(byId(r,'claim_a').challengingRootGroups.length,0);
});
test('different but signed original model protocol is held rather than turned into evidence',()=>{
 const c=catalog();c.variants[0].observations[0].protocolVersion='v2';
 const r=run(c,ledger());rejected(r);
});

test('genuine contradictory signed compatible-protocol measurements are contested rather than averaged',()=>{
 const c=catalog();const extra=observation('oa2','a',110,'independent_professional_test');
 c.variants[0].observations=[...c.variants[0].observations,extra];
 const l=ledger();l.arguments=[...l.arguments,measured('a_failed','a','oa2','independent_measurement','against')];
 const r=run(c,l);assert.equal(r.status,'audited');
 assert.equal(byId(r,'claim_a').state,'contested');
 assert.equal(r.fieldDecision.held.find(x=>x.variantId==='a')?.disposition,'conflict_or_method_mismatch');
 assert.equal(byId(r,'claim_a').reviewerDeclaredSourceGroups,2);
});
