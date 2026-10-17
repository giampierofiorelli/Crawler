/** Phase270 — the dedicated catalog signing component (owner brief §6).
 *
 * It never signs a catalog handed to it. It COMPILES the catalog itself from a validation run and the exact policies
 * (compileCatalog268), checks the result against a signing policy (permitted policy revisions, category and market
 * scope, validity interval, catalog integrity through the same verification the request path uses), and only then signs.
 *
 * Keys. A key is a handle: the private key material lives inside the handle's closure and is never returned, logged,
 * serialised or placed in an envelope or audit record. Two environments are separate by construction:
 *  - 'evaluation': an ephemeral Ed25519 key generated in memory (keyId 'eval_…'), for development and controlled
 *    evaluation; never persisted;
 *  - 'production': NOT ACTIVATED. productionSigningKey270() refuses unconditionally (owner decision 2026-10-17:
 *    production signing is not authorised under the current evidence-validation maturity). The proposed owner-held
 *    setup (key outside every repository, passphrase-encrypted, rotation by dated keyId, pinned public keys with
 *    validity windows) is described in docs/phase270 and needs no paid dependency.
 * A production authority refuses any evaluation keyId, so an evaluation signature can never pass for production.
 */
import {createHash,generateKeyPairSync,sign as edSign,type KeyObject} from 'node:crypto';
import {canonicalJson180,type TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';
import {verifySignedCatalog181,type SignedCatalog181} from './phase181_dynamic_knowledge_ranking.js';
import {compileCatalog268,type ValidationRun268,type ScoringPolicy268,type ValidationPolicy268} from './phase268_evidence_validation.js';

export type SigningEnvironment270='evaluation'|'production';
export interface SigningKey270 {readonly keyId:string;readonly environment:SigningEnvironment270;readonly publicKeyPem:string;
 /** Signs bytes; the private key is not reachable from the handle. */
 sign(bytes:Buffer):Buffer;}
export interface SigningPolicy270 {
 policyId:string;revision:number;environment:SigningEnvironment270;
 /** Exact Phase268 revisions the signer may compile under ('policyId:rN'). */
 validationRevisions:readonly string[];scoringRevisions:readonly string[];
 categories:readonly string[];markets:readonly string[];maxValidityDays:number;
}
/** The evaluation signing policy: the r2 revisions (owner-authorised for labelled partial comparisons only). */
export const EVALUATION_SIGNING_POLICY270:SigningPolicy270={policyId:'pee270-catalog-signing',revision:1,environment:'evaluation',
 validationRevisions:['pee268-test-evidence-validation:r2'],scoringRevisions:['pee268-energy-scoring:r2'],
 categories:['air_fryers','coffee_machines'],markets:['uk'],maxValidityDays:7};

export function evaluationSigningKey270(label='controlled_evaluation'):SigningKey270{
 if(!/^[a-z0-9_]{3,40}$/.test(label))throw Error('phase270_bad_key_label');
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');const priv:KeyObject=privateKey;
 const handle:SigningKey270={keyId:'eval_'+label,environment:'evaluation',publicKeyPem:publicKey.export({type:'spki',format:'pem'}).toString(),
  sign:(bytes:Buffer)=>edSign(null,bytes,priv)};
 // JSON.stringify(handle) carries no key material: the private key exists only in this closure.
 return Object.freeze(handle);
}
/** Production signing is not authorised for activation (owner brief 2026-10-17 §6). */
export function productionSigningKey270():never{throw Error('phase270_production_signing_not_authorised');}

export type SigningRefusal270='environment_mismatch'|'production_not_authorised'|'validation_revision_not_permitted'|'scoring_revision_not_permitted'|
 'category_out_of_scope'|'market_out_of_scope'|'validity_interval_invalid'|'validity_exceeds_policy'|'compiled_catalog_fails_verification'|'nothing_to_sign';
export interface SigningAudit270 {schema:'pee270.signing-audit.v1';signingPolicy:string;environment:SigningEnvironment270;keyId:string;
 validationRevision:string;scoringRevision:string;categoryId:string;market:string;reviewedAt:string;expiresAt:string;
 /** Digests of the exact inputs and of the signed bytes; never values, text or key material. */
 inputsSha256:string;catalogSha256:string;}

const DAY=86400000;
export function signCompiledCatalog270(input:{validation:ValidationRun268;scoring:ScoringPolicy268;validationPolicy:ValidationPolicy268;
  categoryId:string;market:string;discoveredVariantIds:readonly string[];reviewedAt:string;expiresAt:string},
 policy:SigningPolicy270,key:SigningKey270):{ok:true;envelope:SignedCatalog181;audit:SigningAudit270}|{ok:false;reason:SigningRefusal270}{
 if(policy.environment==='production'||key.environment==='production')return {ok:false,reason:'production_not_authorised'};
 if(key.environment!==policy.environment||!key.keyId.startsWith('eval_'))return {ok:false,reason:'environment_mismatch'};
 const vRev=`${input.validationPolicy.policyId}:r${input.validationPolicy.revision}`,sRev=`${input.scoring.policyId}:r${input.scoring.revision}`;
 if(!policy.validationRevisions.includes(vRev))return {ok:false,reason:'validation_revision_not_permitted'};
 if(!policy.scoringRevisions.includes(sRev))return {ok:false,reason:'scoring_revision_not_permitted'};
 if(!policy.categories.includes(input.categoryId))return {ok:false,reason:'category_out_of_scope'};
 if(!policy.markets.includes(input.market))return {ok:false,reason:'market_out_of_scope'};
 const from=Date.parse(input.reviewedAt),to=Date.parse(input.expiresAt);
 if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from)return {ok:false,reason:'validity_interval_invalid'};
 if(to-from>policy.maxValidityDays*DAY)return {ok:false,reason:'validity_exceeds_policy'};
 if(!input.validation.validated.length)return {ok:false,reason:'nothing_to_sign'};
 // The validation run must have been produced under the same revision the catalog will name.
 if(input.validation.validated.some(m=>`${m.policyId}:r${m.policyRevision}`!==vRev))return {ok:false,reason:'validation_revision_not_permitted'};
 const catalog=compileCatalog268(input.validation,input.scoring,{categoryId:input.categoryId,market:input.market,discoveredVariantIds:input.discoveredVariantIds,
  reviewedAt:input.reviewedAt,expiresAt:input.expiresAt,validationPolicy:input.validationPolicy});
 const bytes=Buffer.from(canonicalJson180(catalog));
 const envelope:SignedCatalog181={catalog,keyId:key.keyId,signatureBase64:key.sign(bytes).toString('base64')};
 // Self-check through the verification every consumer uses, at the start of the validity interval.
 const authority:TrustedRankingAuthority180={publicKeys:{[key.keyId]:key.publicKeyPem},asOf:input.reviewedAt,market:input.market};
 if(!verifySignedCatalog181(envelope,authority,{categoryId:input.categoryId}).ok)return {ok:false,reason:'compiled_catalog_fails_verification'};
 const h=(x:unknown)=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
 return {ok:true,envelope,audit:{schema:'pee270.signing-audit.v1',signingPolicy:`${policy.policyId}:r${policy.revision}`,environment:key.environment,keyId:key.keyId,
  validationRevision:vRev,scoringRevision:sRev,categoryId:input.categoryId,market:input.market,reviewedAt:input.reviewedAt,expiresAt:input.expiresAt,
  inputsSha256:h({validated:input.validation.validated.map(m=>m.measurementId).sort(),scoring:input.scoring,validationPolicy:input.validationPolicy,discovered:[...input.discoveredVariantIds].sort()}),
  catalogSha256:h(bytes.toString())}};
}
/** A production ranking authority must pin no evaluation key. */
export function assertProductionAuthority270(a:TrustedRankingAuthority180):void{
 if(Object.keys(a.publicKeys??{}).some(k=>k.startsWith('eval_')))throw Error('phase270_evaluation_key_in_production_authority');
}
