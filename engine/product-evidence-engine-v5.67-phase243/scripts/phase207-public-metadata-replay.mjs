/** Replays authentic VIDEO METADATA ONLY. Test-owned ephemeral signing keys show
 * runtime behaviour, NOT verification of a real reviewer or original footage. */
import fs from 'node:fs';
import {generateKeyPairSync,sign} from 'node:crypto';
import {freezeFingerprints207,freezeMessage207,admitSignedBenchmark207}
 from '../dist/src/phase207_signed_benchmark_admission.js';
const d=JSON.parse(fs.readFileSync('docs/phase206/REAL-VIDEO-METADATA-PILOT.json','utf8'));
const kp=Array.from({length:3},()=>generateKeyPairSync('ed25519'));
const policy={policyId:'ephemeral_demo_not_prod',anchors:kp.map((k,i)=>({keyId:`demo_${i}`,
 principalId:i===0?'demo_coordinator':`demo_reviewer_${i}`,
 role:i===0?'benchmark_coordinator':'independent_video_reviewer',
 publicKeyPem:k.publicKey.export({type:'spki',format:'pem'}).toString(),
 activeFrom:'2026-10-01T00:00:00Z',activeThrough:'2026-11-01T00:00:00Z'}))};
const f={schema:'pee207.freeze.v1',datasetId:d.datasetId,providerId:'native',providerVersion:'207.demo',
 ...freezeFingerprints207(d.cases,[],[]),frozenAt:'2026-10-13T09:00:00Z',blindAccessAttested:true};
const req={schema:'pee207.admission.v1',datasetId:d.datasetId,cases:d.cases,predictions:[],
 pairPredictions:[],frozen:{payload:f,keyId:'demo_0',signatureBase64Url:sign(null,
 Buffer.from(freezeMessage207(f)),kp[0].privateKey).toString('base64url')},
 caseReviews:[],pairReviews:[],policy,asOf:'2026-10-13T10:00:00Z'};
const r=admitSignedBenchmark207(req);
const output={schema:'pee207.public-metadata-replay.1',basis:'public_metadata_only',
 source:'docs/phase206/REAL-VIDEO-METADATA-PILOT.json',testOwnedKeysOnly:true,
 actualCreatorOrVideoContentAuthenticated:false,caseCount:r.benchmark.casesTotal,
 caseGoldAdmitted:r.caseGoldAdmitted,accuracy:r.benchmark.fields.claimKind.accuracyOnPredictions,
 heldCases:r.heldCases,reviewerIndependenceProvenBySignature:r.reviewerIndependenceProvenBySignature,
 productionRankingAuthorized:false};
if(r.caseGoldAdmitted!==0||output.accuracy!==null||r.heldCases.length!==6)throw Error('unexpected_real_metadata_gold');
console.log(JSON.stringify(output,null,2));
