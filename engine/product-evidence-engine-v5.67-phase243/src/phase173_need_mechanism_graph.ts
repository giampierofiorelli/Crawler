/** Phase173 controlled, research-only knowledge graph proposals.
 * The graph is append-only in concept: a distinct proposal fingerprint is never
 * rewritten into scientific truth by a URL, a regex match or a developer label.
 * This is a review packet builder, NOT an evidence admission or ranking gate.
 */
import {createHash} from 'node:crypto';
import {mapGoalToMethodResearch172,listResearchMethods172} from './phase172_domain_protocol_registry.js';
import type {GoalTaskScope173,NeedHypothesis173} from './phase173_goal_scope_adapter.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const sorted=(a:readonly string[])=>[...new Set(a)].sort();
export interface LinkProposal173{
 id:string;fingerprint:string;sourcePhase:172|173;category:string;goalId:string;dimension:string;
 goal:string;possibleMechanisms:readonly string[];possibleFailureModes:readonly string[];
 /** Published methods are references to inspect, not adopted evidence. */
 methodReferences:readonly {methodId:string;url:string;kind:string;doesNotEstablish:string}[];
 methodStatus:'published_method_to_review'|'original_method_missing';
 scientificStatus:'proposed_unreviewed';productEvidenceStatus:'not_provided';
 rankingEligible:false;hardVetoEligible:false;
}
export interface GraphProposal173{
 phase:173;graphSchemaVersion:'173.1';goalRequestHash:string;
 sourcePolicy:'source_link_does_not_validate_causality_or_model';
 links:readonly LinkProposal173[];researchTasks:readonly string[];
 allRelationsProvisional:true;productScoresAvailable:false;
 productRankingAuthorized:false;exclusionsAuthorized:false;
}
/** Human review note is retained with a cryptographic fingerprint of supplied excerpt,
 * but this local program cannot authenticate a reviewer or a source document.
 */
export interface ReviewRecord173{
 phase:173;proposalFingerprint:string;reviewId:string;submittedBy:string;
 evidenceType:'original_professional_protocol'|'manufacturer_installation_manual'|'peer_reviewed_mechanism_study';
 sourceUrl:string;sourceDocumentId:string;sourceVersion:string;
 suppliedExcerpt:string;suppliedExcerptSha256:string;
 reviewerAssessment:'consistent_with_proposal'|'contradicts_proposal'|'inconclusive';
 statedLimitations:readonly string[];
 reviewStatus:'unverified_review_submission';
 reviewerIdentityAuthenticated:false;originalDocumentAuthenticated:false;
 protocolComparabilityVerified:false;productMeasurementProvided:false;
 canPromoteToVerifiedCausalLink:false;rankingAuthorized:false;
}
function validateScope173(x:GoalTaskScope173):void{
 if(x?.phase!==173||!/^([a-f0-9]{64})$/.test(x.inputSha256)||
  x.inherited?.requestSha256!==x.inputSha256||x.rankingAuthorized!==false||
  x.exclusionsAuthorized!==false||x.productEvidenceVerified!==false||
  x.inherited?.rankingAuthorized!==false||x.inherited?.independentEvidenceVerified!==false||
  x.shouldStartProductRanking!==false||!Array.isArray(x.needs))throw Error('phase173_untrusted_scope');
}
function checkedNeed173(n:NeedHypothesis173):void{
 if(!n.id||!/^[a-z][a-z0-9_]+$/.test(n.id)||n.status!=='candidate_requires_specialist_review'||
  n.productMeasurementVerified!==false||n.canDisqualifyProduct!==false||
  !Array.isArray(n.dimensionIds)||!Array.isArray(n.mechanismHypotheses)||
  !Array.isArray(n.possibleFailureModes)||n.dimensionIds.some(d=>!/^[a-z][a-z0-9_]*$/.test(d)))
  throw Error('phase173_untrusted_need');
}
export function proposeNeedMechanismGraph173(scope:GoalTaskScope173):GraphProposal173{
 validateScope173(scope);
 const methodRegistry=mapGoalToMethodResearch172(scope.inherited);
 const references=new Map(methodRegistry.dimensions.map(x=>[x.dimension,x.methods]));
 // The earlier 172 map only listed dimensions previously recognized in that request.
 // Reuse the documentary registry even for NEW 173 usage candidates, without claiming proof.
 for(const m of listResearchMethods172().filter(x=>x.category===scope.target))
  for(const d of m.dimensions)if(!references.has(d))
   references.set(d,listResearchMethods172().filter(x=>x.category===scope.target&&x.dimensions.includes(d)));
 const links:LinkProposal173[]=[];
 for(const need of scope.needs){checkedNeed173(need);
  if(need.category!==scope.target)throw Error('phase173_need_target_mismatch');
  for(const dimension of sorted(need.dimensionIds)){
   const methods=(references.get(dimension)??[]).map(m=>({methodId:m.id,url:m.url,kind:m.kind,doesNotEstablish:m.doesNotEstablish}));
   // New Phase173 dimensions may be absent from the Phase172 plan registry by design.
   const identity=JSON.stringify({v:'173.1',category:need.category,goalId:need.id,dimension,
    mechanisms:sorted(need.mechanismHypotheses),failures:sorted(need.possibleFailureModes)});
   const fingerprint=sha(identity);
   links.push({id:`${need.category}:${need.id}:${dimension}`,fingerprint,
    sourcePhase:need.origin==='inherited_phase172_candidate'?172:173,category:need.category,
    goalId:need.id,dimension,goal:need.goal,possibleMechanisms:sorted(need.mechanismHypotheses),
    possibleFailureModes:sorted(need.possibleFailureModes),methodReferences:methods,
    methodStatus:methods.length?'published_method_to_review':'original_method_missing',
    scientificStatus:'proposed_unreviewed',productEvidenceStatus:'not_provided',
    rankingEligible:false,hardVetoEligible:false});
  }
 }
 links.sort((a,b)=>a.id.localeCompare(b.id));
 const researchTasks=sorted(links.flatMap(l=>[
  `adjudicate_need_mechanism:${l.id}:${l.fingerprint}`,
  ...(l.methodReferences.length?[]:[`find_original_comparable_protocol:${l.category}:${l.dimension}`]),
  `confirm_test_conditions_and_units:${l.category}:${l.dimension}`]));
 return {phase:173,graphSchemaVersion:'173.1',goalRequestHash:scope.inputSha256,
  sourcePolicy:'source_link_does_not_validate_causality_or_model',links,researchTasks,
  allRelationsProvisional:true,productScoresAvailable:false,
  productRankingAuthorized:false,exclusionsAuthorized:false};
}
export function attachUnverifiedReview173(args:{proposal:LinkProposal173;reviewId:string;submittedBy:string;
 evidenceType:ReviewRecord173['evidenceType'];sourceUrl:string;sourceDocumentId:string;
 sourceVersion:string;suppliedExcerpt:string;reviewerAssessment:ReviewRecord173['reviewerAssessment'];
 statedLimitations:readonly string[]}):ReviewRecord173{
 const p=args.proposal;
 if(!p||p.scientificStatus!=='proposed_unreviewed'||p.rankingEligible!==false||
  p.hardVetoEligible!==false||!/^([a-f0-9]{64})$/.test(p.fingerprint))throw Error('phase173_unreviewed_proposal_only');
 if(!/^[a-zA-Z0-9_.:-]{3,100}$/.test(args.reviewId)||
  !/^[a-zA-Z0-9_.:-]{3,100}$/.test(args.submittedBy)||
  !/^https:\/\/[^\s/?#]+\.[^\s/?#]+(?:[^\s]*)$/.test(args.sourceUrl)||
  !/^[\w.:-]{3,150}$/.test(args.sourceDocumentId)||
  !/^[\w.:-]{1,120}$/.test(args.sourceVersion)||
  typeof args.suppliedExcerpt!=='string'||args.suppliedExcerpt.length<30||args.suppliedExcerpt.length>5000||
  !['original_professional_protocol','manufacturer_installation_manual','peer_reviewed_mechanism_study'].includes(args.evidenceType)||
  !['consistent_with_proposal','contradicts_proposal','inconclusive'].includes(args.reviewerAssessment)||
  !Array.isArray(args.statedLimitations)||args.statedLimitations.some(x=>typeof x!=='string'||x.length>500))
  throw Error('phase173_invalid_review_submission');
 return {phase:173,proposalFingerprint:p.fingerprint,reviewId:args.reviewId,submittedBy:args.submittedBy,
  evidenceType:args.evidenceType,sourceUrl:args.sourceUrl,sourceDocumentId:args.sourceDocumentId,
  sourceVersion:args.sourceVersion,suppliedExcerpt:args.suppliedExcerpt,
  suppliedExcerptSha256:sha(args.suppliedExcerpt),reviewerAssessment:args.reviewerAssessment,
  statedLimitations:[...args.statedLimitations],reviewStatus:'unverified_review_submission',
  reviewerIdentityAuthenticated:false,originalDocumentAuthenticated:false,
  protocolComparabilityVerified:false,productMeasurementProvided:false,
  canPromoteToVerifiedCausalLink:false,rankingAuthorized:false};
}
