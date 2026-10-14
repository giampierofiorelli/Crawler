import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {emptyLedger193,recordScreening193,screenBatch193,lookupScreening193,
 saveLedger193,loadLedger193} from '../dist/src/phase193_screening_memory.js';
const sha=s=>createHash('sha256').update(s).digest('hex');
const base={contentBasis:'publisher_bytes',policyVersion:'review-v1',market:'uk',
 classificationRevision:'method-trace-v1',observedAt:'2026-10-01T10:00:00Z'};
const mk=(id,cat,variant,field,website,text)=>({...base,sourceId:id,url:website,
  category:cat,variantId:variant,field,contentHash:sha(text)});
const cases=[
 mk('stars_vac','vacuum','rare_vacuum','carpet_pickup','https://fixtures.example/vacuums','Marketplace star-based top ten.'),
 mk('stars_coffee','coffee_machine','rare_coffee','espresso_pressure','https://fixtures.example/coffee','Commercial marketplace-star roundup.'),
 mk('stars_purifier','air_purifier','rare_air_purifier','smoke_cadr','https://fixtures.example/purifiers','Marketing comparison using consumer stars.'),
 mk('professional','vacuum','reviewed_vacuum','hard_floor_noise','https://lab-fixture.example/vacuum','Original controlled lab method and disclosed measurement.'),
];
let ledger=emptyLedger193();
for(const x of cases){const commercial=x.sourceId.startsWith('stars_');
 ledger=recordScreening193(ledger,{source:x,scope:commercial?'document':'field',
  action:commercial?'discovery_only':'original_evidence_candidate',
  reason:commercial?'marketplace_stars_without_original_test':'reported_original_method_pending_independent_review',
  reviewerId:'simulated_reviewer_fixture',reviewTicket:'SYNTHETIC-REVIEW-'+x.sourceId,
  reviewedAt:'2026-10-01T11:00:00Z',reviewBasis:'human_source_screen',
  evidenceNote:'Synthetic reviewed example used to test caching logic; NOT a real person or verified commercial source.',
  originalTestEventId:commercial?null:'fixture_experiment_1',retainedCandidateVariantIds:[x.variantId]});
}
mkdirSync('evaluation/phase193',{recursive:true});
const path='evaluation/phase193/synthetic-screening-ledger.json';saveLedger193(path,ledger);
const saved=loadLedger193(path);
const secondRun=screenBatch193(saved,cases);
const changed=mk('stars_vac','vacuum','rare_vacuum','carpet_pickup',
 'https://fixtures.example/vacuums','Marketplace list now contains its own original laboratory result.');
const reReview=lookupScreening193(saved,changed);
const newDomain=lookupScreening193(saved,{...cases[0],url:'https://other-fixtures.example/vacuums'});
const annot=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8'));
const sourceCoverage=annot.sourcePages.map(p=>({sourceId:p.id,sourceUrl:p.url,
 contentBasis:'analyst_annotation_not_publisher_bytes',fullDocumentScreeningReused:false}));
const output={phase:193,kind:'illustrative_fixture_not_an_independent_validation',
 derivedCategoryCoverage:sourceCoverage,firstPassScreens:cases.length,
 secondPassReused:secondRun.reused,secondPassScreens:secondRun.needScreening,
 performanceAdmittedByScreening:0,productCandidatesRetained:secondRun.productCandidatesRetained,
 changedPage:reReview.verdict,crossDomainSameHash:newDomain.verdict,
 exclusionOnlyPreventsRepeatScreening:true,
 simulateReviewerIsNotRealHuman:true,publicRankingAllowed:false};
writeFileSync('evaluation/phase193/pilot-results.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
