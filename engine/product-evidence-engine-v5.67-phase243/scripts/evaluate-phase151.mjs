/** Diagnostic over the *previously used* developer corpus; NOT a blind evaluation. */
import {readFileSync,writeFileSync} from 'node:fs';
import {readBidirectionalDocument149} from '../dist/src/phase149_bidirectional_discourse_candidates.js';
import {recoverTypedDocumentReferences151} from '../dist/src/phase151_type_aware_discourse_recovery.js';
const constructed=JSON.parse(readFileSync('evaluation/phase150/CONSTRUCTED-LONG-DOCUMENT-CORPUS.json','utf8')).entries;
const editorial=JSON.parse(readFileSync('research/phase150_original_editorial_short_excerpt_registry.json','utf8')).entries;
const proposed149=new Set(['prior_candidate_unverified','forward_candidate_unverified','cross_paragraph_candidate_unverified']);
const proposed151=new Set(['typed_backward_candidate_unverified','typed_forward_candidate_unverified','typed_cross_paragraph_candidate_unverified','retained_phase149']);
const safeMatch=(p,anchors,target)=>!!p&&p.candidateAnchorIds.length===1&&
 anchors.some(a=>a.id===p.candidateAnchorIds[0]&&a.span.start===target?.start&&a.span.end===target?.end);
const rows=[];
for(const c of constructed){
 const ann=c.annotations[0],vote=ann.votes[0],b=readBidirectionalDocument149(c.input),n=recoverTypedDocumentReferences151(c.input);
 const match=x=>x?.mention.start===ann.mention.start&&x.mention.end===ann.mention.end;
 const bP=b.proposals.find(match),nP=n.proposals.find(match);
 const bProposed=proposed149.has(bP?.status),nProposed=proposed151.has(nP?.decision);
 const bCorrect=bProposed&&safeMatch(bP,b.baseline148.anchors,vote.targetSpan);
 const nCorrect=nProposed&&safeMatch(nP,n.baseline149.baseline148.anchors,vote.targetSpan);
 rows.push({caseId:c.id,categoryId:c.categoryId,phenomenon:ann.phenomenon,
  labelProvenance:'developer_created_nonblind',gold:vote.truth,
  phase149:{status:bP?.status??null,proposed:bProposed,correctTentative:bCorrect},
  phase151:{status:nP?.decision??null,proposed:nProposed,correctTentative:nCorrect,
   evidenceChannelSeparated:nP?.evidenceChannelSeparated??false,
   candidateAnchorIds:nP?.candidateAnchorIds??[]},
  sourceAuthenticated:false,identityAuthenticated:false,scientificClaimAuthorized:false});
}
const counts=which=>{
 const p=rows.filter(r=>r[which].proposed);const same=rows.filter(r=>r.gold==='same_textual_referent');
 const good=p.filter(r=>r[which].correctTentative).length;
 return {constructedCases:rows.length,positiveTextualGold:same.length,
  proposed:p.length,correctProposalsOnDeveloperGold:good,
  falseProposalsOnDeveloperGold:p.length-good,
  missedDeveloperSame:same.filter(r=>!r[which].correctTentative).length,
  descriptiveProposalPrecision:p.length?good/p.length:null,
  descriptiveSameRecall:same.length?same.filter(r=>r[which].correctTentative).length/same.length:null};
};
const report={phase:151,build:'4.75-phase151',baseline:'phase149',
 evaluationDesign:'retrospective nonblind developer-labelled constructed cases only',
 originalFullProfessionalDocuments:0,originalIndependentGold:0,
 precisionOnIndependentOriginalReviews:null,recallOnIndependentOriginalReviews:null,
 editorialShortExcerptsPreviouslyChecked:editorial.map(x=>({id:x.id,url:x.url,independentGold:false})),
 sourceTruthUnverified:true,allProposalsQuarantined:true,
 phase149:counts('phase149'),phase151:counts('phase151'),rows,
 limitations:['not a prospective or source-disjoint holdout','no independent annotation',
 'original source excerpts are not long original source-document evaluations',
 'hypotheses are textual links only: scientific evidence and manufacturer identity not verified',
 'product model detection can miss alternate surface forms','reference recovery not wired to canonical facts or ranking']};
writeFileSync('PHASE151-TYPED-REFERENCE-RECOVERY-DIAGNOSTIC.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({phase149:report.phase149,phase151:report.phase151},null,2));
