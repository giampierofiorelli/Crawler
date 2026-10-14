import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {generateKeyPairSync,sign} from 'node:crypto';
import {advanceUserRequest164,newRequestSession164} from '../src/phase164_user_request_journey.js';
import {auditQuantifiedRequest166} from '../src/phase166_quantified_evidence_bridge.js';
import {buildExplicitUserReview170,verifyAndAdmitResearch170}
 from '../src/phase170_durable_research_admission.js';
import {signingBytes169,type SignedReceipt169,type TrustKey169,type UserAttestation169}
 from '../src/phase169_signed_suitability_research.js';
import type {CategoryBrain128} from '../src/phase128_category_cognition_dialogue_bridge.js';

const question='Best coffee machine width under 35 cm';
const brain:CategoryBrain128={categoryId:'coffee_machine',schemaVersion:1,aliases:['coffee machine'],
 sources:[],concepts:[],quality:[],distinctions:[]};
const request=advanceUserRequest164(newRequestSession164('session_alpha'),{
 turnId:'turn_one',question,language:'en',brains:[brain]});
const pair=generateKeyPairSync('ed25519');
const key:TrustKey169={keyId:'gateway_key',actorId:'event_gateway',role:'user_session_issuer',
 publicKeyPem:pair.publicKey.export({format:'pem',type:'spki'}).toString(),
 validFrom:'2026-10-01T00:00:00.000Z',validUntil:'2026-11-01T00:00:00.000Z',
 revoked:false,allowedSourceIds:[]};
let number=0;
function receipt():SignedReceipt169{
 const q=auditQuantifiedRequest166(question);
 assert.ok(q.candidates.length);
 const payload:UserAttestation169={kind:'user_constraint',sessionId:request.session.sessionId,
  sessionRevision:request.session.revision,sessionEpoch:request.session.epoch,
  turnId:request.turnId,questionSha256:request.requestSha256,
  target:{kind:'quantity',quantityId:q.candidates[0].id,exactPhrase:q.candidates[0].span.literal}};
 const unsigned={version:1 as const,receiptId:`receipt_${++number}`,keyId:'gateway_key',
  actorId:'event_gateway',issuedAt:'2026-10-12T11:00:00.000Z',
  expiresAt:'2026-10-13T11:00:00.000Z',payload};
 return {...unsigned,signature:sign(null,signingBytes169(unsigned),pair.privateKey).toString('base64')};
}
function inputs(receipts:SignedReceipt169[]){return {
 question,request,facets:[],trustedKeys:[key],receipts,now:'2026-10-12T12:00:00.000Z'
};}
const script=resolve('scripts/phase170_replay_ledger.py');

 test('full-question confirmation review keeps unparsed text and never auto-confirms',()=>{
  const draft=buildExplicitUserReview170(question,request);
  assert.equal(draft.originalQuestion,question);
  assert.equal(draft.confirmed,false);
  assert.equal(draft.userActionRequired,true);
  assert.ok(draft.proposedQuantities.length);
  assert.equal(draft.unknownRequirementsMayRemain,true);
 });
 test('wrong question cannot generate confirmation review',()=>{
  assert.throws(()=>buildExplicitUserReview170('Something else',request),/mismatch/);
 });
 test('real signed Phase169 user event is admitted and persisted by Phase170',()=>{
  const dir=mkdtempSync(join(tmpdir(),'pee170-'));const db=join(dir,'ledger.sqlite3');
  try{
   const result=verifyAndAdmitResearch170({verifiedInputs:inputs([receipt()]),
    databasePath:db,ledgerScriptPath:script});
   assert.equal(result.state,'admitted_research_only');
   assert.equal(result.signedResearch.receiptAudits.length,1);
   assert.equal(result.humanIdentityVerified,false);
   assert.equal(result.scientificIndependenceVerified,false);
   assert.equal(result.rankingAuthorized,false);
   assert.equal(existsSync(db),true);
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
 test('verified signed receipt cannot replay after process persisted it',()=>{
  const dir=mkdtempSync(join(tmpdir(),'pee170-'));const db=join(dir,'ledger.sqlite3');
  try{
   const r=receipt();const run=()=>verifyAndAdmitResearch170({verifiedInputs:inputs([r]),
    databasePath:db,ledgerScriptPath:script});
   assert.equal(run().receiptIds[0],r.receiptId);
   assert.throws(run,/atomic_admission_rejected/);
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
 test('invalid signature fails before creating the database',()=>{
  const dir=mkdtempSync(join(tmpdir(),'pee170-'));const db=join(dir,'ledger.sqlite3');
  try{
   const r=receipt();r.signature='A'.repeat(86)+'==';
   assert.throws(()=>verifyAndAdmitResearch170({verifiedInputs:inputs([r]),
    databasePath:db,ledgerScriptPath:script}),/bad_receipt_signature/);
   assert.equal(existsSync(db),false);
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
 test('no receipts is not mistaken for consent',()=>{
  const dir=mkdtempSync(join(tmpdir(),'pee170-'));const db=join(dir,'ledger.sqlite3');
  try{
   assert.throws(()=>verifyAndAdmitResearch170({verifiedInputs:inputs([]),
    databasePath:db,ledgerScriptPath:script}),/unsafe_phase170/);
   assert.equal(existsSync(db),false);
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
