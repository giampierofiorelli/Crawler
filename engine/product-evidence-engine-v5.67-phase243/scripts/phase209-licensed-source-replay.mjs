/** Real licensed-source pages, NO media bytes, NO human review, NO gold labels.
 * Reuses Phase206 native evaluator, no new scoring/ranking implementation. */
import {readFileSync,writeFileSync} from 'node:fs';
import {canonicalReviewableVideo209} from '../dist/src/phase209_licensed_original_media.js';
import {evaluateVideoEvidence206} from '../dist/src/phase206_video_evidence_benchmark.js';
const leads=JSON.parse(readFileSync('docs/phase209/LICENSED-VIDEO-SOURCE-LEADS.json','utf8'));
if(leads.mediaBodiesDownloaded!==0||leads.specialistReviews!==0||leads.sources.length!==2)throw Error('lead_metadata_changed');
const scopes=[{categoryId:'coffee_machines',criterionId:'espresso_preparation',disciplineId:'espresso_preparation'},
 {categoryId:'knives',criterionId:'sharpening',disciplineId:'knife_care'}];
const cases=leads.sources.map((r,i)=>({caseId:r.caseId,
 videoUrl:canonicalReviewableVideo209(r.pageUrl).url,referenceUrl:canonicalReviewableVideo209(r.pageUrl).url,
 ...scopes[i],variantId:'model_unverified',language:'en',sourceReviewId:null,
 reviewBasis:'metadata_only',sourceKind:'public_metadata_lead'}));
const dataset={schema:'206.dataset.1',datasetId:'phase209_licensed_leads',
 provenance:'source_linked_unblinded_pilot',cases,judgments:[],eventPairs:[]};
const evalResult=evaluateVideoEvidence206(dataset,[],[],'pee_native_205','not_executed');
if(evalResult.independentlyLabelledCases!==0||evalResult.fields.claimKind.accuracyOnPredictions!==null)throw Error('impossible_gold');
const summary={schema:'pee209.licensed-lead-replay.v1',sourceLeads:cases.length,
 contentBytesRetrieved:0,contentVideosViewed:0,frameExtractedFromRealSources:0,
 qualificationValidated:0,humanReviewersEnrolled:0,independentGoldLabels:0,
 providersActuallyRun:0,accuracy:null,scopedCases:cases,
 comparisonReused:'phase206_video_evidence_benchmark',scientificClaimsAllowed:false,
 note:'A valid Commons CC source-page statement does not authenticate original bytes or expertise.'};
if(process.argv.includes('--write'))writeFileSync('docs/phase209/LICENSED-METADATA-REPLAY.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({sourceLeads:summary.sourceLeads,gold:summary.independentGoldLabels,accuracy:summary.accuracy},null,2));
