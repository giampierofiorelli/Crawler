import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {advanceUserRequest164,newRequestSession164} from '../src/phase164_user_request_journey.js';
import {previewOriginalReviewMeasures167} from '../src/phase167_source_variant_quantity_adapter.js';
import {auditQuantifiedRequest166} from '../src/phase166_quantified_evidence_bridge.js';
import {planSignedSuitabilityResearch169,signingBytes169,
 type SignedReceipt169,type TrustKey169,type UserAttestation169,type SourceAttestation169}
 from '../src/phase169_signed_suitability_research.js';
import {verifyAndAdmitResearch170,type ResearchAdmission170,type AdmissionInput170}
 from '../src/phase170_durable_research_admission.js';
import {reconcileOriginalSourceConflicts171,type DeclaredMethodLineage171}
 from '../src/phase171_source_conflict_workbench.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
import type {CategoryBrain128} from '../src/phase128_category_cognition_dialogue_bridge.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const question='Best coffee machine width under 35 cm';
const brain:CategoryBrain128={categoryId:'coffee_machine',schemaVersion:1,aliases:['coffee machine'],
 sources:[],concepts:[],quality:[],distinctions:[]};
const request=advanceUserRequest164(newRequestSession164('session_sample'),{
 turnId:'turn_one',question,language:'en',brains:[brain]});
const userPair=generateKeyPairSync('ed25519');
const sourcePair=generateKeyPairSync('ed25519');
const keyBase={validFrom:'2026-10-01T00:00:00.000Z',validUntil:'2026-11-01T00:00:00.000Z',revoked:false};
let i=0;
function receipt(payload:UserAttestation169|SourceAttestation169):SignedReceipt169 {
 const user=payload.kind==='user_constraint';
 const unsigned={version:1 as const,receiptId:`receipt_p171_${++i}`,
  keyId:user?'user_key':'source_key',actorId:user?'gateway':'source_reviewer',
  issuedAt:'2026-10-12T11:00:00.000Z',expiresAt:'2026-10-13T11:00:00.000Z',payload};
 return {...unsigned,signature:sign(null,signingBytes169(unsigned),user?userPair.privateKey:sourcePair.privateKey).toString('base64')};
}
function build(specs:readonly {value:number;source:string;family:string|null;
 protocol?:string|null;condition?:string|null;version?:string|null;extra?:string}[],
 options:{user?:boolean;reviewed?:boolean}={}){
 const sources=specs.map(s=>{
  const text=`The Orion coffee machine measured ${s.value} cm in width. ${s.extra??s.source}.`;
  const reader:ReaderInput139={document:{text,sha256:sha(text),source:{id:s.source,
   originalDocumentId:`doc_${s.source}`,url:`https://example.org/${s.source}`,title:'Constructed',
   role:'original_product_test'}},pageIdentity:{reviewedProductId:'orion',
   reviewedVariantId:'orion_variant',reviewedAliases:['Orion coffee machine']}};
  return {reader,binding:{productId:'orion',variantId:'orion_variant',sourceId:s.source,
   originalDocumentId:`doc_${s.source}`,documentSha256:sha(text),
   reviewedAliases:['Orion coffee machine'],identityIndependentlyAuthenticated:false as const,
   sourceIndependentlyAuthenticated:false as const}};
 });
 const quantitative=previewOriginalReviewMeasures167({question,request,products:['orion'],sources});
 const found=quantitative.candidateMeasures.filter(c=>c.disposition==='candidate_pending_scientific_review');
 assert.equal(found.length,specs.length,'fixture must produce one properly scoped measurement per document');
 const qs=auditQuantifiedRequest166(question);
 const receipts:SignedReceipt169[]=[];
 if(options.user!==false)receipts.push(receipt({kind:'user_constraint',sessionId:request.session.sessionId,
  sessionRevision:request.session.revision,sessionEpoch:request.session.epoch,
  turnId:request.turnId,questionSha256:request.requestSha256,
  target:{kind:'quantity',quantityId:qs.candidates[0].id,exactPhrase:qs.candidates[0].span.literal}}));
 if(options.reviewed!==false)for(const c of found){
  receipts.push(receipt({kind:'source_candidate',questionSha256:request.requestSha256,
   target:{kind:'quantity',candidateId:c.id,variantId:c.variantId!,sourceId:c.sourceId,
    documentSha256:c.documentSha256,spanSha256:c.quantitySpan.sha256},
   protocolReference:'constructed_documentary_method',methodReview:'documented',
   variantReview:'documented',rightsReview:'documented'}));
 }
 const keys:TrustKey169[]=[
  {...keyBase,keyId:'user_key',actorId:'gateway',role:'user_session_issuer',
   publicKeyPem:userPair.publicKey.export({type:'spki',format:'pem'}).toString(),allowedSourceIds:[]},
  {...keyBase,keyId:'source_key',actorId:'source_reviewer',role:'source_reviewer',
   publicKeyPem:sourcePair.publicKey.export({type:'spki',format:'pem'}).toString(),allowedSourceIds:specs.map(s=>s.source)}
 ];
 const verifiedInputs:AdmissionInput170={question,request,facets:[],quantitative,
  trustedKeys:keys,receipts,now:'2026-10-12T12:00:00.000Z'};
 const signedResearch=planSignedSuitabilityResearch169({...verifiedInputs,previouslyAcceptedReceiptIds:new Set()});
 // Unit-level fixture only; a separate test exercises the REAL SQLite gateway.
 const admitted:ResearchAdmission170={phase:170,state:'admitted_research_only',
  sessionId:request.session.sessionId,epoch:request.session.epoch,revision:request.session.revision,
  revisionFingerprint:signedResearch.revisionFingerprint,receiptIds:signedResearch.receiptAudits.map(x=>x.receiptId).sort(),
  signedResearch,humanIdentityVerified:false,scientificIndependenceVerified:false,
  rankingAuthorized:false,publicationAuthorized:false,exclusionsAuthorized:false};
 const declaredLineage:DeclaredMethodLineage171[]=found.map(c=>{
  const s=specs.find(x=>x.source===c.sourceId)!;
  return {candidateId:c.id,sourceId:c.sourceId,originalDocumentId:c.originalDocumentId,
   documentSha256:c.documentSha256,editorialFamilyId:s.family,
   protocolId:s.protocol===undefined?'protocol_1':s.protocol,
   protocolVersion:s.version===undefined?'version_1':s.version,
   conditionId:s.condition===undefined?'condition_kitchen':s.condition,
   familyIndependentlyAuthenticated:false,methodIndependentlyValidated:false,
   sourceRightsIndependentlyVerified:false};
 });
 const run=(opts:Record<string,unknown>={})=>reconcileOriginalSourceConflicts171({admitted,
  originalVerifiedInputs:verifiedInputs,quantitative,declaredLineage,...opts});
 return {run,admitted,verifiedInputs,quantitative,declaredLineage,found};
}
const one=(r:ReturnType<ReturnType<typeof build>['run']>)=>r.items.find(x=>x.kind==='quantity')!;
const spec=(value:number,source:string,family:string|null,more:Record<string,string|null>={})=>
 ({value,source,family,...more});

test('one editorial family does not masquerade as two independent tests',()=>{
 const a=build([spec(31,'source_a','family_one'),spec(32,'source_b','family_one')]);
 const r=one(a.run());assert.equal(r.disposition,'single_editorial_family_only');
 assert.equal(r.distinctDeclaredFamilies,1);assert.equal(r.distinctOriginalDocuments,2);
 assert.equal(r.eligibleForRanking,false);
});
test('matching protocol and two declared families yield only unverified convergence',()=>{
 const a=build([spec(31,'source_a','family_one'),spec(32,'source_b','family_two')]);
 const r=one(a.run());assert.equal(r.disposition,'apparent_cross_family_agreement_unverified');
 assert.equal(r.distinctDeclaredFamilies,2);assert.equal(r.supportingCandidateIds.length,2);
 assert.equal(a.run().rankingAuthorized,false);
});
test('same declared protocol with incompatible fits is flagged for adjudication',()=>{
 const a=build([spec(31,'source_a','family_one'),spec(37,'source_b','family_two')]);
 const r=one(a.run());assert.equal(r.disposition,'conflict_under_declared_same_method');
 assert.equal(r.supportingCandidateIds.length,1);assert.equal(r.opposingCandidateIds.length,1);
});
test('different test condition is not automatically labelled contradictory evidence',()=>{
 const a=build([spec(31,'source_a','family_one'),spec(37,'source_b','family_two',{condition:'condition_garage'})]);
 assert.equal(one(a.run()).disposition,'different_methods_not_directly_comparable');
});
test('one publisher family contains an internal conflict, not multiple corroborating tests',()=>{
 const a=build([spec(31,'source_a','family_one'),spec(37,'source_b','family_one')]);
 assert.equal(one(a.run()).disposition,'conflict_within_editorial_family');
});

test('two conditions within one publisher do not count as a direct conflict',()=>{
 const a=build([spec(31,'source_a','family_one'),spec(37,'source_b','family_one',{condition:'condition_basement'})]);
 assert.equal(one(a.run()).disposition,'different_methods_not_directly_comparable');
});
test('one matching protocol with conflict is flagged even if another protocol exists',()=>{
 const a=build([spec(31,'source_a','family_a'),spec(37,'source_b','family_b'),
  spec(29,'source_c','family_c',{condition:'condition_basement'})]);
 assert.equal(one(a.run()).disposition,'conflict_under_declared_same_method');
});
test('a changed methodology version must not be silently merged',()=>{
 const a=build([spec(31,'source_a','family_a'),spec(37,'source_b','family_b',{version:'version_2'})]);
 assert.equal(one(a.run()).disposition,'different_methods_not_directly_comparable');
});

test('unknown method or publisher lineage blocks synthesis',()=>{
 const a=build([spec(31,'source_a',null)]);
 assert.equal(one(a.run()).disposition,'method_lineage_missing');
});
test('explicit signed reviewer alone does not create user confirmation',()=>{
 const a=build([spec(31,'source_a','family_one')],{user:false});
 assert.equal(one(a.run()).disposition,'user_confirmation_pending');
});
test('user receipt alone cannot make a source a reviewed measurement',()=>{
 const a=build([spec(31,'source_a','family_one')],{reviewed:false});
 assert.equal(one(a.run()).disposition,'documentary_review_missing');
 assert.deepEqual(one(a.run()).candidateTraces,[]);
});

test('missing original reviews leaves the requirement open, never a negative product verdict',()=>{
 const a=build([]);const r=one(a.run());
 assert.equal(r.disposition,'original_evidence_missing');
 assert.equal(r.distinctOriginalDocuments,0);
 assert.equal(r.eligibleForExclusion,false);
});
test('unknown or duplicated lineage entries fail closed',()=>{
 const a=build([spec(31,'source_a','family_one')]);
 assert.throws(()=>a.run({declaredLineage:[...a.declaredLineage,...a.declaredLineage]}),/lineage_not_bound/);
 const invalid={...a.declaredLineage[0],candidateId:'unmatched_candidate'};
 assert.throws(()=>a.run({declaredLineage:[invalid]}),/lineage_not_bound/);
});

test('modified source identity cannot be smuggled into declared lineage',()=>{
 const a=build([spec(31,'source_a','family_one')]);
 const modified=[{...a.declaredLineage[0],documentSha256:sha('tamper')}];
 assert.throws(()=>a.run({declaredLineage:modified}),/lineage_not_bound/);
});
test('pretending lineage was independently authenticated is rejected',()=>{
 const a=build([spec(31,'source_a','family_one')]);
 assert.throws(()=>a.run({declaredLineage:[{...a.declaredLineage[0],familyIndependentlyAuthenticated:true}]}),/lineage_not_bound/);
});
test('wrong question or falsified signedResearch object is refused',()=>{
 const a=build([spec(31,'source_a','family_one')]);
 assert.throws(()=>a.run({originalVerifiedInputs:{...a.verifiedInputs,question:'other'}}));
 const forged={...a.admitted,signedResearch:{...a.admitted.signedResearch,rankingAuthorized:true}};
 assert.throws(()=>a.run({admitted:forged}),/admission_integrity_mismatch/);
});
test('modified attestation signature is refused on revalidation',()=>{
 const a=build([spec(31,'source_a','family_one')]);
 const receipts=a.verifiedInputs.receipts.map((r,i)=>i===0?{...r,signature:'A'.repeat(86)+'=='}:r);
 assert.throws(()=>a.run({originalVerifiedInputs:{...a.verifiedInputs,receipts}}),/signature/);
});
test('quantitative payload cannot be changed after the Phase170 admission',()=>{
 const a=build([spec(31,'source_a','family_one')]);
 const altered={...a.quantitative,candidateMeasures:a.quantitative.candidateMeasures.map(c=>({...c,canonicalValue:42}))};
 assert.throws(()=>a.run({quantitative:altered}),/wrong_or_modified_original_measurements/);
});
test('lineage and receipts in another order do not affect research disposition',()=>{
 const a=build([spec(31,'source_a','family_one'),spec(32,'source_b','family_two')]);
 const x=a.run(),y=a.run({declaredLineage:[...a.declaredLineage].reverse()});
 assert.deepEqual(x,y);
});
test('real Ed25519 verification and SQLite admission can feed Phase171 research',()=>{
 const a=build([spec(31,'source_a','family_one')]);
 const dir=mkdtempSync(join(tmpdir(),'pee171-'));const db=join(dir,'ledger.sqlite3');
 try{
  const admitted=verifyAndAdmitResearch170({verifiedInputs:a.verifiedInputs,databasePath:db,
   ledgerScriptPath:resolve('scripts/phase170_replay_ledger.py')});
  const output=a.run({admitted});
  assert.equal(one(output).disposition,'single_editorial_family_only');
  assert.equal(output.publicationAuthorized,false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
