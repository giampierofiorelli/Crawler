import test from 'node:test';import assert from 'node:assert/strict';
import {validateSourceDescriptor258,type SourceDescriptor258} from '../src/phase258_source_contributions.js';
import {emptySourceLedger258,recordSourceState258,currentSourceState258,successorSource258,validateSourceLedger258,
 validateFeedback258,summarizeFeedback258,selectSourcesForJob258,type SourceStateEvent258In} from '../src/phase258_source_memory.js';
// Phase258 checkpoint B, written before the module. Synthetic source fixtures (".example"); no network.
const AT='2026-10-16T10:00:00.000Z';
const desc=(id:string,o:Partial<SourceDescriptor258>):SourceDescriptor258=>validateSourceDescriptor258({schema:'pee258.source-descriptor.v1',origin:'synthetic_fixture',descriptorId:'d_'+id,sourceId:'s_'+id,
 url:`https://${id}.example/p`,roles:['manufacturer_specification'],statementKinds:['declared_specification'],publisherCountry:'GB',language:'en-GB',productMarket:'uk',
 product:{productId:'prd_a',identityStatus:'unverified'},testingConditions:{declared:false,conditionIds:[]},method:{described:false,referenceId:null},specialist:null,
 culturalTradition:null,sponsorship:'none_declared',originality:'original',derivedFrom:[],access:{rights:'unreviewed',robots:'unknown'},statement:null,limitations:[],...o});
const ev=(sourceId:string,state:SourceStateEvent258In['state'],cause:SourceStateEvent258In['cause'],at=AT):SourceStateEvent258In=>({sourceId,state,cause,at});

test('source states are append-only history: 404 is temporary, retirement needs an operator, findings are never erased',()=>{
 let L=emptySourceLedger258();
 L=recordSourceState258(L,ev('s_new_blog','discovered',{kind:'discovery',reviewId:null}),);
 assert.equal(currentSourceState258(L,'s_new_blog'),'discovered','an unknown source can be added without a whitelist');
 L=recordSourceState258(L,ev('s_new_blog','reviewed',{kind:'review',reviewId:'rv_1'}));
 L=recordSourceState258(L,ev('s_new_blog','temporarily_unavailable',{kind:'http_status',httpStatus:404}));
 assert.equal(currentSourceState258(L,'s_new_blog'),'temporarily_unavailable');
 assert.equal(L.events.length,3,'history kept');assert.equal(L.findingsDeleted,false);
 assert.throws(()=>recordSourceState258(L,ev('s_new_blog','retired',{kind:'http_status',httpStatus:410})),/retire/);
 L=recordSourceState258(L,ev('s_new_blog','retired',{kind:'operator_retirement',reviewId:'rv_2'}));
 assert.equal(currentSourceState258(L,'s_new_blog'),'retired');
 const tampered={...L,events:L.events.map((e,i)=>i===1?{...e,state:'useful' as const}:e)};
 assert.throws(()=>validateSourceLedger258(tampered),/chain/);
 assert.throws(()=>recordSourceState258(L,ev('s_x','useful',{kind:'review',reviewId:'rv'})),/useful/,'usefulness needs verified feedback');
});
test('a moved or changed source inherits neither permissions nor credibility',()=>{
 let L=emptySourceLedger258();
 L=recordSourceState258(L,ev('s_lab','reviewed',{kind:'review',reviewId:'rv_1'}));
 L=recordSourceState258(L,ev('s_lab','moved',{kind:'redirect',newUrl:'https://newlab.example/p',newSourceId:'s_lab_2'}));
 const succ=successorSource258(L,'s_lab');
 assert.deepEqual(succ,{sourceId:'s_lab_2',state:'discovered',predecessor:'s_lab',inheritsPermissions:false,inheritsReviews:false,inheritsFeedback:false});
 L=recordSourceState258(L,ev('s_mag','reviewed',{kind:'review',reviewId:'rv_3'}));
 L=recordSourceState258(L,ev('s_mag','changed',{kind:'ownership_change',reviewId:null}));
 assert.equal(currentSourceState258(L,'s_mag'),'changed');assert.equal(L.reReviewRequired.includes('s_mag'),true);
});
test('feedback records verified contribution, keeps dimensions apart, computes no score and never rewards agreement',()=>{
 const f={schema:'pee258.contribution-feedback.v1',feedbackId:'fb_1',sourceId:'s_lab',jobId:'research_'+'a'.repeat(32),scope:{categoryId:'air_fryers',criterion:'capacity_min',productId:'prd_a'},
  outcome:'confirmed_specification',reviewId:'rv_9',at:AT,reliability:'not_assessed',evidenceQuality:{originality:'original',methodReported:true},
  relevance:'exact_product_and_criterion',cost:{sourceReads:1,minutes:5},eligibility:{rights:'reviewed_metadata_only',robots:'allowed'}};
 assert.equal(validateFeedback258(f).outcome,'confirmed_specification');
 assert.throws(()=>validateFeedback258({...f,agreesWithPEE:true}),/unknown field/);
 assert.throws(()=>validateFeedback258({...f,score:0.8}),/unknown field/);
 assert.throws(()=>validateFeedback258({...f,reviewId:null}),/review/);
 assert.throws(()=>validateFeedback258({...f,outcome:'agreed_with_current_opinion'}),/outcome/);
 const s=summarizeFeedback258([f,{...f,feedbackId:'fb_2',outcome:'revealed_error'},{...f,feedbackId:'fb_3',sourceId:'s_other',outcome:'no_contribution'}]);
 assert.equal(s.scoresComputed,false);assert.equal(s.bySource.s_lab.revealed_error,1);assert.equal(s.bySource.s_other.no_contribution,1);
 assert.ok(!('score' in s.bySource.s_lab));
});
test('dry-run selection: role fit for the gap, no geographic preference, exploration kept, restricted excluded, derivatives collapsed',()=>{
 const D=[desc('maker',{}),desc('shop',{roles:['retailer_listing'],publisherCountry:'US',language:'en-US',productMarket:'us'}),
  desc('lab',{roles:['independent_measurement'],statementKinds:['instrumental_measurement'],method:{described:true,referenceId:'m1'},publisherCountry:'DE',language:'de-DE',productMarket:'de'}),
  desc('copy',{roles:['derivative_publication'],statementKinds:['reported_experience'],originality:'derivative',derivedFrom:['s_lab']}),
  desc('chef',{roles:['qualified_cultural_expertise'],statementKinds:['expert_interpretation'],publisherCountry:'IT',language:'it-IT',productMarket:'it',
   specialist:{domainId:'espresso_preparation',basis:'documented_professional_practice',basisReferenceId:'ref'}}),
  desc('blocked',{access:{rights:'not_permitted',robots:'disallowed'}})];
 const spec=selectSourcesForJob258({job:{productId:'prd_a',criterion:'capacity_min',gapKind:'missing_declaration'},descriptors:D,feedback:[],states:emptySourceLedger258(),maxSources:3});
 assert.deepEqual(spec.selected.slice(0,2).map(x=>x.sourceId).sort(),['s_maker','s_shop'],'a declaration gap goes to declaring sources first');
 assert.ok(!spec.selected.some(x=>x.sourceId==='s_chef'||x.sourceId==='s_lab'&&x.lane==='declaration'),'opinion never fills a specification gap');
 assert.ok(spec.excluded.some(x=>x.sourceId==='s_blocked'&&x.reason==='access_not_permitted'));
 const test2=selectSourcesForJob258({job:{productId:'prd_a',criterion:'crisp_texture',gapKind:'missing_test'},descriptors:D,feedback:[],states:emptySourceLedger258(),maxSources:4});
 assert.equal(test2.selected[0].sourceId,'s_lab','a test gap goes to measurement first');
 assert.ok(test2.collapsed.some(x=>x.sourceId==='s_copy'&&x.duplicateOf==='s_lab'),'a derivative of a selected original is not a second source');
 assert.ok(test2.selected.every(x=>x.identityStatus==='unverified'));
 const chef=test2.selected.find(x=>x.sourceId==='s_chef');assert.ok(!chef||chef.lane==='interpretation','expertise is interpretation, never measurement');
 // Geography: swapping publisher countries and languages changes nothing.
 const swapped=D.map(d=>({...d,publisherCountry:d.publisherCountry==='DE'?'GB':d.publisherCountry==='GB'?'DE':d.publisherCountry}));
 const again=selectSourcesForJob258({job:{productId:'prd_a',criterion:'crisp_texture',gapKind:'missing_test'},descriptors:swapped,feedback:[],states:emptySourceLedger258(),maxSources:4});
 assert.deepEqual(again.selected.map(x=>x.sourceId),test2.selected.map(x=>x.sourceId));
 assert.equal(test2.requesterCountryUsed,false);assert.equal(test2.publisherCountryUsed,false);
 // Exploration: with feedback history on familiar sources, one unfamiliar candidate keeps a slot.
 assert.ok(spec.explorationSlotUsed||spec.selected.some(x=>x.unfamiliar));
});
test('a source about another product is never selected; an unattributed source never declares or measures',()=>{
 const D=[desc('own',{}),desc('other',{product:{productId:'prd_b',identityStatus:'unverified'}}),
  desc('general',{roles:['independent_measurement'],statementKinds:['instrumental_measurement'],method:{described:true,referenceId:'m'},product:{productId:null,identityStatus:'unverified'}})];
 const s=selectSourcesForJob258({job:{productId:'prd_a',criterion:'capacity_min',gapKind:'missing_declaration'},descriptors:D,feedback:[],states:emptySourceLedger258(),maxSources:3});
 assert.deepEqual(s.selected.map(x=>x.sourceId),['s_own']);assert.ok(s.excluded.some(x=>x.sourceId==='s_other'&&x.reason==='other_product'));
 const t=selectSourcesForJob258({job:{productId:'prd_a',criterion:'noise',gapKind:'missing_test'},descriptors:D,feedback:[],states:emptySourceLedger258(),maxSources:3});
 assert.ok(!t.selected.some(x=>x.sourceId==='s_general'),'an unattributed measurement is not this product\'s measurement');
});
