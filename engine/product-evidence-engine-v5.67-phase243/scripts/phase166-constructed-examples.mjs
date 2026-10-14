/** Synthetic phase166 examples: reproducible plumbing, NOT model accuracy. */
import {writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {newRequestSession164,advanceUserRequest164} from '../dist/src/phase164_user_request_journey.js';
import {auditQuantifiedRequest166,screenQuestionEvidence166} from '../dist/src/phase166_quantified_evidence_bridge.js';
const sha=s=>createHash('sha256').update(s).digest('hex');
const brain={categoryId:'coffee_machine',schemaVersion:1,
 aliases:['coffee machine','espresso machine'],sources:[{id:'fixture_source',url:'https://example.org/fixture',title:'Constructed',originalDocumentId:'fixture_doc',role:'original_expert_method'}],
 concepts:[{id:'steam_wand',kind:'capability',label:'Steam wand',aliases:['steam wand'],evidenceKeys:['steam_test'],state:'reviewed_definition',review:{reviewId:'fixture_review',reviewerId:'fixture_reviewer',sourceRefIds:['fixture_source'],reviewScope:'category_definition'}}],quality:[],distinctions:[]};
const sample=['Coffee machine width under 35 cm','Coffee machine width below 350 mm','Coffee machine width under 30 cm and width over 35 cm',
 'Coffee machine under 35 cm','Coffee machine no deeper than 40 cm','Coffee machine noise under 45 dB',
 'Coffee machine tank capacity at least 750 ml','Coffee machine width between 25 and 35 cm',
 'Best coffee machine under £300','Coffee machine width preferably under 35 cm',
 'Air fryer basket capacity under 2 quarts','Coffee machine noise no more than 45 dBA'];
const observations=[{id:'measurement_1',productId:'machine_a',metric:'width',canonicalUnit:'cm',value:34,sourceKind:'independent_original_test',sourceUrl:'https://example.org/constructed/test-a',originalDocumentId:'constructed_doc_a',documentSha256:sha('constructed only'),testProtocolId:'width_test',reviewReceiptId:'unverified_receipt',independentlyAuthenticated:false},
{id:'measurement_2',productId:'machine_b',metric:'width',canonicalUnit:'cm',value:40,sourceKind:'independent_original_test',sourceUrl:'https://example.org/constructed/test-b',originalDocumentId:'constructed_doc_b',documentSha256:sha('constructed only B'),testProtocolId:'width_test',reviewReceiptId:'unverified_receipt',independentlyAuthenticated:false}];
const question=sample[0];
const request=advanceUserRequest164(newRequestSession164('phase166_diagnostic'),{turnId:'turn_1',question,language:'en',brains:[brain]});
const screened=screenQuestionEvidence166(request,question,['machine_a','machine_b'],observations);
const result={phase:166,kind:'synthetic-engineering-diagnostic-not-expert-review',
 sourceNote:'All sample questions and measurements are invented test cases; example.org is not an authentic expert source.',
 sampleCount:sample.length,samples:sample.map(question=>({question,...auditQuantifiedRequest166(question)})),
 screening:{screens:screened.screens,obligations:screened.researchObligations,
 independentlyAuthenticated:screened.independentReviewAuthenticated,publicationAuthorized:screened.publicationAuthorized}};
const path=process.argv[2];if(!path||existsSync(path))throw Error('Provide an unused output path');
writeFileSync(path,JSON.stringify(result,null,2)+'\n');
console.log(`Produced ${sample.length} synthetic linguistic cases, ${screened.screens.length} provisional product screens; no rankings.`);
