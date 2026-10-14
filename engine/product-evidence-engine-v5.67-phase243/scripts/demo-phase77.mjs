/** Phase 77 offline demo. ALL research signals and product evidence are constructed. */
import {mkdtemp,rm} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {demandScopeHash,planDemand,evaluatePortfolio,triageNewEntrant} from '../dist/src/phase77_decision_research.js';
import {Phase77ProgressLedger} from '../dist/src/phase77_progress_ledger.js';
const request={mode:'functional_discovery',outcomeIds:['mattress_dust_removal'],
 mustHaveIds:['low_moisture','fabric_safe'],exclusionIds:['bleach'],
 regionId:'uk',productId:null,confirmedBy:'user'};
const families=[{familyId:'upholstery_vacuum',categoryId:'vacuum_cleaners',relation:'reviewed_applicable',evidenceReferenceIds:['fictional_1']},
 {familyId:'spot_extractor',categoryId:'spot_cleaners',relation:'reviewed_applicable',evidenceReferenceIds:['fictional_2']}];
const plan=planDemand(request,families);
const incomplete=evaluatePortfolio({demand:request,families:[{familyId:'upholstery_vacuum',disposition:'evaluated',evidenceReferenceIds:['fictional_1']},
 {familyId:'spot_extractor',disposition:'not_checked',evidenceReferenceIds:[]}],
 candidates:[],sourceLandscapeReviewed:false,discoveryReproducible:false,searchBoundaryReviewed:false});
const signal=triageNewEntrant({productId:'fictional_new_vac',familyId:'upholstery_vacuum',
 signalId:'fictional_signal_1',signalType:'independent_original_test',
 sourceRightsCleared:true,originalTestId:'fictional_original_test',
 relevanceToConfirmedOutcomes:['mattress_dust_removal'],alreadyKnownOriginalTests:[],
 isAlreadyTrackedProduct:false},request);
const dir=await mkdtemp(path.join(os.tmpdir(),'pee77-demo-'));
try{
 const store=new Phase77ProgressLedger(path.join(dir,'progress.json'));
 const saved=await store.submit(demandScopeHash(request),request.mode);
 const reopened=new Phase77ProgressLedger(store.filePath);
 const loaded=await reopened.publicStatus(saved.view.requestId,saved.accessToken);
 console.log(JSON.stringify({demo_only:true,all_evidence_constructed:true,
  mode:request.mode,solutionRoute:plan.kind,
  portfolioStatus:incomplete.status,portfolioGaps:incomplete.reasons,
  challengerAction:signal.action,challengerMayReorder:false,
  initialUserStatus:loaded?.status,verifiedStages:loaded?.completedVerifiedSteps,
  nextScheduledCheckAt:loaded?.nextScheduledCheckAt,estimatedCompletionAt:loaded?.estimatedCompletionAt,
  notificationTransportConnected:false,realWebSearchConnected:false,realModelConnected:false},null,2));
}finally{await rm(dir,{recursive:true,force:true});}
