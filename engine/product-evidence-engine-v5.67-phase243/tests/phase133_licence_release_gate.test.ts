import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {auditBundle133,inspectLicensedProposal133,type Artifact133,type ModelBundle133} from '../src/phase133_licence_release_gate.js';
const h=(s:string)=>createHash('sha256').update(s).digest('hex');
const artifact=(name:string,kind:Artifact133['kind']):Artifact133=>({name,kind,version:'1.0.0',sha256:h(name),
 license:'Apache-2.0',licenseUrl:'https://example.org/license',originUrl:'https://example.org/origin',
 independentlyReviewed:true,reviewReference:'review-record-133',distributionCostEUR:0,usageFeeEUR:0,
 requiresPrivatePermission:false,externalServiceRequired:false,noticePreserved:true,commercialUseConfirmed:true});
const bundle=():ModelBundle133=>({modelId:'test-local',modelDigest:h('weights'),offlineRuntime:true,sourceRevision:'commit-abc',
 artifacts:[artifact('gliner2','code'),artifact('checkpoint','weights'),artifact('torch','runtime_dependency')]});
const broken=(f:(a:Artifact133)=>void)=>{const b=bundle();f(b.artifacts[1]);return b};
test('complete independently reviewed permissive offline manifest meets policy without granting truth',()=>{const a=auditBundle133(bundle());assert.equal(a.admissible,true);assert.equal(a.knowledgeWriteAuthorized,false);assert.equal(a.rankingAuthorized,false)});
test('noncommercial weights are excluded even if code is Apache licensed',()=>assert.ok(auditBundle133(broken(a=>a.license='CC-BY-NC-4.0')).reasons.includes('unapproved_or_unknown_license')));
test('unknown weight licence fails closed',()=>assert.equal(auditBundle133(broken(a=>a.license='unknown')).admissible,false));
test('closed-source or copyleft dependency cannot be admitted without separate policy change',()=>assert.equal(auditBundle133(broken(a=>a.license='GPL-3.0')).admissible,false));
test('no private permission, subscription, paid usage or online service',()=>{
 for(const change of [
 (a:Artifact133)=>{a.requiresPrivatePermission=true},
 (a:Artifact133)=>{a.usageFeeEUR=0.01},
 (a:Artifact133)=>{a.distributionCostEUR=1},
 (a:Artifact133)=>{a.externalServiceRequired=true}])assert.equal(auditBundle133(broken(change)).admissible,false);
});
test('unreviewed transitive libraries, missing library/weights and unpinned versions block admission',()=>{
 assert.equal(auditBundle133(broken(a=>a.independentlyReviewed=false)).admissible,false);
 const b=bundle();b.artifacts.pop();assert.equal(auditBundle133(b).admissible,false);
 const c=bundle();c.sourceRevision='';assert.equal(auditBundle133(c).admissible,false);
});
test('notice and commercial rights are mandatory',()=>{
 assert.equal(auditBundle133(broken(a=>a.noticePreserved=false)).admissible,false);
 assert.equal(auditBundle133(broken(a=>a.commercialUseConfirmed=false)).admissible,false);
});
test('duplicate or forged artifact inventory rejected',()=>{const b=bundle();b.artifacts.push({...b.artifacts[0]});assert.equal(auditBundle133(b).admissible,false);});
test('approved manifest still only creates reviewable hypothesis, not ranking',()=>{
 const t='CADR measures particle removal.';
 const src={sourceId:'epa',originalDocumentId:'epa1',text:t,sha256:h(t)};
 const x={modelId:'test-local',modelDigest:h('weights'),sourceId:'epa',originalDocumentId:'epa1',documentSha256:h(t),
 subject:{start:0,end:4},object:{start:14,end:30},evidence:{start:0,end:t.length},predictedRelation:'measures' as const};
 const r=inspectLicensedProposal133(x,src,bundle());assert.equal(r.licenceAdmitted,true);
 assert.equal(r.status,'requires_human_review');assert.equal(r.rankingAuthorized,false);assert.equal(r.knowledgeWriteAuthorized,false);
 const bad=bundle();bad.artifacts[1].license='CC-BY-NC-4.0';
 assert.equal(inspectLicensedProposal133(x,src,bad).status,'rejected');
});
test('untrusted registry cannot silently accept different model digest',()=>{
 const b=bundle();const t='CADR measures particle removal.';
 const x={modelId:'test-local',modelDigest:h('different'),sourceId:'epa',originalDocumentId:'epa1',documentSha256:h(t),
 subject:{start:0,end:4},object:{start:14,end:30},evidence:{start:0,end:t.length},predictedRelation:'measures' as const};
 assert.ok(inspectLicensedProposal133(x,{sourceId:'epa',originalDocumentId:'epa1',text:t,sha256:h(t)},b).reasons.includes('model_identity_mismatch'));
});
