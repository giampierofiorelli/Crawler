/** Phase170: verified research receipts -> transactional replay ledger.
 * THIS IS NOT A PRODUCTION AUTHENTICATION/AUTHORIZATION IMPLEMENTATION.
 * Only a trusted server may call it. Source & user identity remain unproven.
 */
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {auditQuantifiedRequest166} from './phase166_quantified_evidence_bridge.js';
import {planSignedSuitabilityResearch169, type SuitabilityResearch169} from './phase169_signed_suitability_research.js';
import type {RequestOutput164} from './phase164_user_request_journey.js';

export type AdmissionInput170=Omit<Parameters<typeof planSignedSuitabilityResearch169>[0],
 'previouslyAcceptedReceiptIds'>;

export interface ResearchAdmission170 {
 phase:170;state:'admitted_research_only';sessionId:string;epoch:number;
 revision:number;revisionFingerprint:string;receiptIds:readonly string[];
 signedResearch:SuitabilityResearch169;
 /** A receipt ledger cannot authenticate a human or a professional source. */
 humanIdentityVerified:false;scientificIndependenceVerified:false;
 rankingAuthorized:false;publicationAuthorized:false;exclusionsAuthorized:false;
}

/** This draft is a UX prompt, NOT an authenticated user confirmation event. */
export function buildExplicitUserReview170(question:string,request:RequestOutput164):{
 phase:170;originalQuestion:string;questionSha256:string;
 proposedQuantities:readonly {id:string;literal:string;scope:string}[];
 proposedQualities:readonly {aspectId:string;literal:string;proposedMeaning:string}[];
 userActionRequired:true;confirmed:false;unknownRequirementsMayRemain:true;
 rankingAuthorized:false;
} {
 if(request.phase!==164||createHash('sha256').update(question).digest('hex')!==request.requestSha256||
   request.requestSha256!==request.session.history.at(-1)?.questionSha256)
  throw Error('phase170_review_request_mismatch');
 const q=auditQuantifiedRequest166(question);
 return {phase:170,originalQuestion:question,questionSha256:request.requestSha256,
  proposedQuantities:q.candidates.map(c=>({id:c.id,literal:c.span.literal,scope:c.scope})),
  proposedQualities:(request.contextAudit165?.occurrences??[]).map(o=>({
   aspectId:o.aspectId,literal:o.literal,proposedMeaning:o.proposedMeaning})),
  userActionRequired:true,confirmed:false,unknownRequirementsMayRemain:true,rankingAuthorized:false};
}

/** Use after Phase169 signature + scope verification, before any downstream research-only use.
 * Python >=3.10 SQLite3 stdlib is used to support Node20 without runtime npm deps.
 * dbPath and scriptPath MUST be protected, operator-controlled values, not HTTP/body fields.
 * The Python ledger does not validate signatures: this entry point does so first.
 */
export function verifyAndAdmitResearch170(input:{
 verifiedInputs:AdmissionInput170;databasePath:string;ledgerScriptPath:string;
 pythonExecutable?:string;
}):ResearchAdmission170 {
 const {verifiedInputs}=input;
 if(!input.databasePath||!input.ledgerScriptPath||typeof input.databasePath!=='string'||
   typeof input.ledgerScriptPath!=='string')throw Error('invalid_phase170_operator_configuration');
 // No untrusted receiptId list is supplied to the ledger; all IDs come from
 // Phase169 after signature, role, scope, expiry and document binding checks.
 const signedResearch=planSignedSuitabilityResearch169({...verifiedInputs,
   previouslyAcceptedReceiptIds:new Set<string>()});
 if(signedResearch.rankingAuthorized||signedResearch.publicationAuthorized||
   signedResearch.confirmedHumanIdentity||signedResearch.independentScientificReviewApproved||
   signedResearch.receiptAudits.length!==verifiedInputs.receipts.length||
   !signedResearch.receiptAudits.length)throw Error('unsafe_phase170_research_admission');
 const request=verifiedInputs.request;
 const receiptIds=signedResearch.receiptAudits.map(r=>r.receiptId).sort();
 const body={phase:170,sessionId:request.session.sessionId,epoch:request.session.epoch,
  revision:request.session.revision,turnId:request.turnId,questionSha256:request.requestSha256,
  revisionFingerprint:signedResearch.revisionFingerprint,receiptIds,
  rankingAuthorized:false,publicationAuthorized:false,humanIdentityVerified:false};
 const process=spawnSync(input.pythonExecutable??'python3',
  [input.ledgerScriptPath,'--db',input.databasePath],{
    input:JSON.stringify(body),encoding:'utf8',timeout:15000,maxBuffer:300000,
    windowsHide:true,shell:false,env:{...processEnvMinimal170()}});
 if(process.error||process.status!==0)throw Error('phase170_atomic_admission_rejected');
 let ack:unknown;
 try{ack=JSON.parse(process.stdout);}catch{throw Error('phase170_malformed_ledger_ack');}
 if(!ack||typeof ack!=='object')throw Error('phase170_malformed_ledger_ack');
 const a=ack as Record<string,unknown>;
 if(a.status!=='admitted_research_only'||a.fingerprint!==signedResearch.revisionFingerprint||
   a.receiptCount!==receiptIds.length||a.sessionId!==request.session.sessionId||
   a.epoch!==request.session.epoch||a.revision!==request.session.revision||
   a.rankingAuthorized!==false||a.humanIdentityVerified!==false)
   throw Error('phase170_ledger_ack_mismatch');
 return {phase:170,state:'admitted_research_only',sessionId:request.session.sessionId,
  epoch:request.session.epoch,revision:request.session.revision,
  revisionFingerprint:signedResearch.revisionFingerprint,receiptIds,signedResearch,
  humanIdentityVerified:false,scientificIndependenceVerified:false,
  rankingAuthorized:false,publicationAuthorized:false,exclusionsAuthorized:false};
}

/** Keep operator-provided subprocess paths independent from user-provided environment.
 * This helper deliberately does not use a shell; deployment must still restrict
 * the operator API that supplies interpreter/script paths.
 */
function processEnvMinimal170():NodeJS.ProcessEnv{
 return {PATH:process.env.PATH??'/usr/bin:/bin',LANG:'C.UTF-8',PYTHONDONTWRITEBYTECODE:'1'};
}
