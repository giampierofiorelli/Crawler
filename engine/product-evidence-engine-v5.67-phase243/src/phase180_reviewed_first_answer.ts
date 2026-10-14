/** Phase180: signed, precomputed category ranking projection for the web-first first response.
 * This is a PUBLICATION GATE, not an expert-review service or a model that can
 * certify its own evidence. It cannot be enabled by an NLP suggestion, a source
 * URL, or an in-band "approved" boolean. Only an offline reviewed snapshot,
 * independently signed using a pinned trusted public key, can supply an order.
 * Signature authenticates provenance, NOT scientific correctness.
 */
import {createHash,createPublicKey,verify} from 'node:crypto';
import {assertDecisionSnapshot177,type DecisionSnapshot177} from './phase177_decision_snapshot.js';
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const id=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x);
const stamp=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(x)&&!Number.isNaN(Date.parse(x));
const https=(x:unknown):x is string=>typeof x==='string'&&x.length<2048&&/^https:\/\/[^\s/]+\//.test(x);
const unique=<T>(items:readonly T[])=>new Set(items).size===items.length;
const integer=(x:unknown,min=0,max=10000)=>Number.isSafeInteger(x)&&Number(x)>=min&&Number(x)<=max;
/** Stable canonical JSON, independent of object property insertion order. */
export function canonicalJson180(x:unknown):string{
 if(x===null||typeof x==='boolean'||typeof x==='string')return JSON.stringify(x);
 if(typeof x==='number'&&Number.isFinite(x))return JSON.stringify(x);
 if(Array.isArray(x))return '['+x.map(canonicalJson180).join(',')+']';
 if(typeof x==='object'&&Object.getPrototypeOf(x)===Object.prototype){
  const obj=x as Record<string,unknown>;return '{'+Object.keys(obj).sort().map(k=>JSON.stringify(k)+':'+canonicalJson180(obj[k])).join(',')+'}';
 }
 throw Error('phase180_noncanonical_data');
}
export interface OriginalEvidence180 {
 id:string; variantId:string; originalTestId:string; methodId:string; protocolVersion:string;
 sourceUrl:string; observedAt:string; scope:'exact_variant_original_professional_test';
}
export interface RatedCriterion180 { key:string; valuePoints:number; evidenceIds:readonly string[]; }
export interface HardAssessment180 { key:string; outcome:'pass'|'fail'|'unknown'; evidenceIds:readonly string[]; }
export interface ReviewedVariant180 {
 id:string; name:string; criteria:readonly RatedCriterion180[];
 hardAssessments:readonly HardAssessment180[];
}
export interface ReviewedRelease180 {
 phase:180; schema:'180.1'; market:string; categoryId:string; rankInputFingerprint:string;
 evidenceRevision:string; policyRevision:string; reviewedAt:string; expiresAt:string;
 /** All discovered candidates in this wave, including unmeasured products. */
 discoveredVariantIds:readonly string[]; coverageStatement:string;
 /** We do NOT claim the entire market is exhausted. */
 marketCoverageComplete:false;
 /** Ordinal preference weights come from an external reviewed policy, not guessed from hard/high/normal. */
 criteriaWeights:ReadonlyArray<{key:string;weightUnits:number;elicitationReference:string;methodId:string;protocolVersion:string}>;
 /** Binds the actual confirmed meaning. Phase177 fingerprint alone intentionally omits
  * free-text labels; without this guard a label-only edit could silently drift. */
 reviewedCriteria:ReadonlyArray<{key:string;label:string;value:unknown;priority:string}>;
 evidence:readonly OriginalEvidence180[]; variants:readonly ReviewedVariant180[];
 externalReviewReference:string;
}
export interface SignedRelease180 {release:ReviewedRelease180;keyId:string;signatureBase64:string;}
export interface TrustedRankingAuthority180 {
 /** Server-supplied out-of-band pinned keys; NEVER accepted from the HTTP client. */
 readonly publicKeys:Readonly<Record<string,string>>;
 readonly asOf:string;
 readonly market:string;
}
export type FirstAnswer180={phase:180;status:'ranking_ready'|'not_ready';
 language:'en';firstLayer:readonly string[];visibleCautions:readonly string[];
 rankInputFingerprint:string; evidenceRevision:string|null;policyRevision:string|null;
 ranked:readonly {variantId:string;name:string;rank:number;scorePoints:number;
   originalTestIds:readonly string[];sourceUrls:readonly string[]}[];
 held:readonly {variantId:string;name:string;reason:string}[];
 coverage:{discovered:number;reviewed:number;unreviewed:number;marketCoverageComplete:false};
 fullRankingAvailable:boolean;noEvidenceWasInvented:true;};
function notReady(s:DecisionSnapshot177,reason:string):FirstAnswer180{
 return {phase:180,status:'not_ready',language:'en',firstLayer:['No verified product ranking is available for these confirmed needs.'],
  visibleCautions:[reason],rankInputFingerprint:s.rankInputFingerprint,evidenceRevision:null,policyRevision:null,
  ranked:[],held:[],coverage:{discovered:0,reviewed:0,unreviewed:0,marketCoverageComplete:false},
  fullRankingAvailable:false,noEvidenceWasInvented:true};
}
function validateRelease(r:ReviewedRelease180):void{
 if(!r||r.phase!==180||r.schema!=='180.1'||!id(r.market)||!id(r.categoryId)||
   !/^[0-9a-f]{64}$/.test(r.rankInputFingerprint)||!id(r.evidenceRevision)||!id(r.policyRevision)||
   !stamp(r.reviewedAt)||!stamp(r.expiresAt)||Date.parse(r.reviewedAt)>=Date.parse(r.expiresAt)||
   r.marketCoverageComplete!==false||!Array.isArray(r.discoveredVariantIds)||
   !r.discoveredVariantIds.length||r.discoveredVariantIds.length>1000||!r.discoveredVariantIds.every(id)||
   !unique(r.discoveredVariantIds)||typeof r.coverageStatement!=='string'||
   r.coverageStatement.length<12||r.coverageStatement.length>500||!id(r.externalReviewReference)||
   !Array.isArray(r.criteriaWeights)||!r.criteriaWeights.length||r.criteriaWeights.length>40||
   !Array.isArray(r.reviewedCriteria)||r.reviewedCriteria.length!==r.criteriaWeights.length||
   !unique(r.reviewedCriteria.map((c:{key:string})=>c.key))||
   r.reviewedCriteria.some((c:{key:string;label:string;priority:string;value:unknown})=>
     !id(c.key)||typeof c.label!=='string'||c.label.length<3||c.label.length>300||
     !['hard','high','normal','low'].includes(c.priority)||
     !c.value||typeof c.value!=='object')||
   !Array.isArray(r.evidence)||r.evidence.length>6000||!Array.isArray(r.variants)||
   r.variants.length>1000||!unique(r.variants.map(v=>v.id)))throw Error('phase180_invalid_release');
 const w=new Map<string,number>();const protocols=new Map<string,{methodId:string;protocolVersion:string}>();let sum=0;
 for(const c of r.criteriaWeights){if(!id(c.key)||w.has(c.key)||!integer(c.weightUnits,1)||!id(c.elicitationReference)||!id(c.methodId)||!id(c.protocolVersion))throw Error('phase180_unreviewed_weights');w.set(c.key,c.weightUnits);protocols.set(c.key,{methodId:c.methodId,protocolVersion:c.protocolVersion});sum+=c.weightUnits;}
 if(sum!==10000)throw Error('phase180_weights_not_normalized');
 const allowed=new Set(r.discoveredVariantIds);const evidence=new Map<string,OriginalEvidence180>();
 for(const e of r.evidence){
  if(!id(e.id)||evidence.has(e.id)||!allowed.has(e.variantId)||!id(e.originalTestId)||
   !id(e.methodId)||!id(e.protocolVersion)||!https(e.sourceUrl)||!stamp(e.observedAt)||
   e.scope!=='exact_variant_original_professional_test'||Date.parse(e.observedAt)>Date.parse(r.reviewedAt))throw Error('phase180_invalid_original_evidence');
  evidence.set(e.id,e);
 }
 for(const v of r.variants){
  if(!id(v.id)||!allowed.has(v.id)||typeof v.name!=='string'||v.name.trim().length<2||v.name.length>180||
   !Array.isArray(v.criteria)||!Array.isArray(v.hardAssessments)||!unique(v.criteria.map((c:RatedCriterion180)=>c.key))||
   !unique(v.hardAssessments.map((h:HardAssessment180)=>h.key)))throw Error('phase180_invalid_variant');
  for(const c of v.criteria){if(!w.has(c.key)||!integer(c.valuePoints)||!Array.isArray(c.evidenceIds)||
    c.evidenceIds.length!==1||!unique(c.evidenceIds)||c.evidenceIds.some((e:string)=>evidence.get(e)?.variantId!==v.id||
     evidence.get(e)?.methodId!==protocols.get(c.key)?.methodId||
     evidence.get(e)?.protocolVersion!==protocols.get(c.key)?.protocolVersion))throw Error('phase180_missing_or_misscoped_measurement');}
  for(const h of v.hardAssessments){if(!w.has(h.key)||!['pass','fail','unknown'].includes(h.outcome)||
    !Array.isArray(h.evidenceIds)||!unique(h.evidenceIds)||h.evidenceIds.some((e:string)=>evidence.get(e)?.variantId!==v.id||
     evidence.get(e)?.methodId!==protocols.get(h.key)?.methodId||
     evidence.get(e)?.protocolVersion!==protocols.get(h.key)?.protocolVersion)||
    (h.outcome!=='unknown'&&!h.evidenceIds.length)||
    (h.outcome==='unknown'&&h.evidenceIds.length>0))throw Error('phase180_unverified_hard_gate');}
 }
}
/** Pass only releases previously vetted by a separate offline professional review
 * process. This method verifies signature/scope/structural provenance, not claims. */
export function reviewedFirstAnswer180(snapshot:DecisionSnapshot177, signed:SignedRelease180|null,
 authority:TrustedRankingAuthority180):FirstAnswer180{
 assertDecisionSnapshot177(snapshot);
 if(!authority||!stamp(authority.asOf)||!id(authority.market)||!authority.publicKeys||
  Object.getPrototypeOf(authority.publicKeys)!==Object.prototype)throw Error('phase180_invalid_authority');
 const confirmed=snapshot.criteria.filter(c=>c.status==='confirmed');
 if(snapshot.scope.task!=='product_selection'&&snapshot.scope.task!=='solution_comparison')return notReady(snapshot,'This task has not been confirmed as a shopping decision.');
 if(!snapshot.scope.category)return notReady(snapshot,'The product category has not been confirmed. A goal-to-solution investigation may be required.');
 if(!confirmed.length)return notReady(snapshot,'No requirements have been confirmed. Suggested needs cannot authorize rankings.');
 if(!signed)return notReady(snapshot,'No offline-reviewed and authenticated product-evidence release is connected for these needs.');
 if(typeof signed.keyId!=='string'||!id(signed.keyId)||typeof signed.signatureBase64!=='string'||
  !/^[a-zA-Z0-9+/]+={0,2}$/.test(signed.signatureBase64)||signed.signatureBase64.length>4096)
  return notReady(snapshot,'Invalid reviewed-release signature envelope.');
 const key=Object.prototype.hasOwnProperty.call(authority.publicKeys,signed.keyId)?authority.publicKeys[signed.keyId]:null;
 if(!key)return notReady(snapshot,'The release signer is not an approved publishing authority.');
 try{
  const digest=Buffer.from(canonicalJson180(signed.release),'utf8');
  const signature=Buffer.from(signed.signatureBase64,'base64');
  if(signature.length!==64||!verify(null,digest,createPublicKey(key),signature))
   return notReady(snapshot,'The evidence release signature is invalid.');
  validateRelease(signed.release);
 }catch{return notReady(snapshot,'The signed release is malformed or fails the required evidence checks.');}
 const r=signed.release;
 if(r.market!==authority.market)return notReady(snapshot,'The reviewed evidence was prepared for a different market.');
 if(r.rankInputFingerprint!==snapshot.rankInputFingerprint||r.categoryId!==snapshot.scope.category)return notReady(snapshot,'The reviewed ranking was prepared for different confirmed needs or category.');
 if(Date.parse(authority.asOf)>Date.parse(r.expiresAt)||Date.parse(authority.asOf)<Date.parse(r.reviewedAt))
  return notReady(snapshot,'The reviewed evidence release is stale or not yet valid.');
 const weights=new Map(r.criteriaWeights.map(c=>[c.key,c.weightUnits]));
 if(confirmed.length!==weights.size||confirmed.some(c=>!weights.has(c.key)||
  !r.reviewedCriteria.some(x=>x.key===c.key&&x.label===c.label&&x.priority===c.priority&&
   canonicalJson180(x.value)===canonicalJson180(c.value))))
  return notReady(snapshot,'The reviewed scoring policy does not cover every confirmed criterion.');
 const hard=new Set(confirmed.filter(c=>c.priority==='hard').map(c=>c.key));
 const ev=new Map(r.evidence.map(e=>[e.id,e]));
 const ranked:FirstAnswer180['ranked'][number][]=[],held:FirstAnswer180['held'][number][]=[];
 for(const p of r.variants){
  const gates=new Map(p.hardAssessments.map(h=>[h.key,h]));
  const failure=[...hard].find(k=>gates.get(k)?.outcome==='fail');
  if(failure){held.push({variantId:p.id,name:p.name,reason:`Reviewed evidence reports failure of essential criterion: ${failure}`});continue;}
  if([...hard].some(k=>gates.get(k)?.outcome!=='pass')){
   held.push({variantId:p.id,name:p.name,reason:'Essential compatibility is not established.'});continue;
  }
  const perf=new Map(p.criteria.map(c=>[c.key,c]));
  if([...weights.keys()].some(k=>!perf.has(k))){held.push({variantId:p.id,name:p.name,reason:'Comparable test results are missing for one or more confirmed criteria.'});continue;}
  const scorePoints=Math.round([...weights].reduce((s,[k,w])=>s+(perf.get(k)!.valuePoints*w),0)/10000);
  const allRefs=[...new Set([...p.criteria.flatMap(c=>c.evidenceIds),...p.hardAssessments.flatMap(h=>h.evidenceIds)])];
  ranked.push({variantId:p.id,name:p.name,rank:0,scorePoints,
    originalTestIds:[...new Set(allRefs.map(k=>ev.get(k)!.originalTestId))].sort(),
    sourceUrls:[...new Set(allRefs.map(k=>ev.get(k)!.sourceUrl))].sort()});
 }
 ranked.sort((a,b)=>b.scorePoints-a.scorePoints||a.variantId.localeCompare(b.variantId));
 for(let i=0;i<ranked.length;i++)ranked[i].rank=i&&ranked[i].scorePoints===ranked[i-1].scorePoints?ranked[i-1].rank:i+1;
 held.sort((a,b)=>a.variantId.localeCompare(b.variantId));
 const reviewed=new Set(r.variants.map(v=>v.id));const unreviewed=r.discoveredVariantIds.filter(id=>!reviewed.has(id));
 for(const variantId of unreviewed)held.push({variantId,name:variantId,reason:'Discovered candidate with no reviewed product assessment.'});
 held.sort((a,b)=>a.variantId.localeCompare(b.variantId));
 return {phase:180,status:ranked.length?'ranking_ready':'not_ready',language:'en',
  firstLayer:ranked.length?[
    `Best fit among ${ranked.length} evidence-eligible products under the reviewed policy: ${ranked[0].name}.`,
    `A full ranked comparison is available for the confirmed needs.`]:['No evidence-eligible product can currently be ranked for these needs.'],
  visibleCautions:[`Reviewed market discovery recorded ${r.discoveredVariantIds.length} candidates; it does not establish complete market coverage.`,
   ...(held.length?[`${held.length} candidates are held out or lack comparable evidence; they have not been silently dropped.`]:[]),
   'The scoring policy and evidence review are externally attested; a signature alone does not establish scientific validity.'],
  rankInputFingerprint:snapshot.rankInputFingerprint,evidenceRevision:r.evidenceRevision,policyRevision:r.policyRevision,
  ranked,held,coverage:{discovered:r.discoveredVariantIds.length,reviewed:r.variants.length,
  unreviewed:unreviewed.length,marketCoverageComplete:false},
  fullRankingAvailable:ranked.length>0,noEvidenceWasInvented:true};
}
