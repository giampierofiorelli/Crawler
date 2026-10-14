import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {readScopedLexicalFrames142} from '../dist/src/phase142_scoped_lexical_frames.js';
import {readLexicalEnglish141} from '../dist/src/phase141_local_lexical_resources.js';
const demos=[
 ['affirmative','The Aster X2 utilizes a filter.'],
 ['negated_target','The Aster X2 utilizes no filter.'],
 ['passive','The Aster X2 is outmatched by B4 Pro on carpets.'],
 ['incidental_comparator','The Aster X2 outmatches competitors including B4 Pro.'],
 ['explicit_comparator','The Aster X2 outmatches B4 Pro on carpets.'],
 ['modal','If the Aster X2 utilizes a filter, its performance may improve.'],
 ['coordinated','The Aster X2 supplies a dock and furnishes a brush.'],
 ['quoted','The brochure reads “Aster X2 supplies perfect cleaning”.'],
 ['unknown_reference','It utilizes a filter.'],
 ['different_variant','The Aster X3 supplies a filter.'],
];
const mk=(text,id,metadata={})=>({document:{text,sha256:createHash('sha256').update(text).digest('hex'),source:{id,originalDocumentId:id+'_snap',url:metadata.url??'https://example.invalid/synthetic',title:'Evaluation scenario',role:'original_product_test'}},pageIdentity:{reviewedProductId:metadata.reviewedProductId??'aster',reviewedVariantId:metadata.reviewedVariantId??'x2',reviewedAliases:metadata.reviewedAliases??['Aster X2']}});
function simplify(f){return {lemma:f.lexicalLemma,structure:f.structure,status:f.status,issue:f.issue,object:f.objectSpan,sourceVerified:f.sourceVerified,roleAssignmentsVerified:f.roleAssignmentsVerified};}
const constructed=demos.map(([id,text])=>{const i=mk(text,id);const before=readLexicalEnglish141(i),after=readScopedLexicalFrames142(i);return {id,text,old:before.lexicalProposals.map(f=>({status:f.status,object:f.objectSpan})),new:after.frames.map(simplify),changed:after.changedDisposition,bounded:after.boundedObjects};});
const original=JSON.parse(readFileSync('research/phase140_original_excerpt_diagnostic/PHASE140-NEW-PUBLISHER-EXCERPTS.json'));
const previousOriginalExcerpts=original.examples.map(e=>{const i=mk(e.text,e.id,e);const before=readLexicalEnglish141(i),after=readScopedLexicalFrames142(i);return {id:e.id,publisher:e.publisher,sourceUrl:e.url,previousCount:before.lexicalProposals.length,newCount:after.frames.length,changed:after.changedDisposition,objectBounds:after.boundedObjects};});
const out={phase:142,date:'2026-10-11',evaluationType:'authored_adversarial_regression_plus_previously_seen_professional_passages',independentGoldCases:0,independentAccuracy:null,originalReviewSourceCheckedByThisRun:false,rightsForRedistributionNotClaimed:true,constructed,previousOriginalExcerpts};
writeFileSync('PHASE142-SCOPE-AND-ROLE-DIAGNOSTIC.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({constructed:constructed.length,oldProposals:constructed.reduce((n,x)=>n+x.old.length,0),newProposals:constructed.reduce((n,x)=>n+x.new.length,0),changed:constructed.reduce((n,x)=>n+x.changed,0),previousOriginalExcerpts},null,2));
