/** Research-only deterministic replay; entirely authored fixture texts, not real review sources. */
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {findDocumentCandidates194,evaluateCandidateRetrieval194} from '../dist/src/phase194_candidate_retrieval.js';
const sha=s=>createHash('sha256').update(s).digest('hex');
const samples=['vacuum','headphones','laptop','air_purifier','coffee_machine'];
const doc=(id,t,variant)=>({sourceId:id,url:`https://${id}.example/article/`,text:t,
 contentHash:sha(t),basis:'analyst_annotation',variantIds:[variant]});
const corpus=[];const gold=[];
for(let i=0;i<70;i++){
 const category=samples[i%samples.length];
 const t=`The independently authored original technical study number ${i} investigates ${category} capabilities in a controlled experiment. Its own measurement protocol, exact product variant, conditions of operation, trial length, testing materials, instrument setup, recording process, exposure conditions and limitations are separately reported. The measurements taken at laboratory location ${i} concern precise functional attributes rather than universal product quality. Expert observations are distinguished from instrument readings and commercial marketplace marketing descriptions. Further testing may be needed for usability and long term reliability.`;
 corpus.push(doc('s'+i,t,category));
}
for(let k=0;k<8;k++){
 const a=corpus[k],t=k%2===0?a.text:a.text.replace('commercial marketplace marketing descriptions','retail advertising summaries');
 const clone=doc('clone'+k,t,a.variantIds[0]);corpus.push(clone);
 gold.push({sourceA:a.sourceId,sourceB:clone.sourceId,textuallyRelated:true,
  reviewedBy:'fixture_author_only',reviewProtocol:'synthetic_exact_and_small_edits'});
}
for(let i=20;i<30;i++)gold.push({sourceA:'s'+i,sourceB:'s'+(i+20),textuallyRelated:false,
 reviewedBy:'fixture_author_only',reviewProtocol:'synthetic_distinct_experiments'});
const now=performance.now();const report=findDocumentCandidates194(corpus);const elapsed=performance.now()-now;
const score=evaluateCandidateRetrieval194(report,gold);
const out={phase:194,kind:'authored_synthetic_retrieval_benchmark_not_external_gold',
 documents:report.documents,allPairsPossible:report.allPairsPossible,
 pairsComparedAfterBlocking:report.pairsConsidered,candidatePairs:report.candidates.length,
 exactPublisherDuplicatesAuthenticated:0,experimentMergesAuthorized:false,
 goldPairsAuthored:score.labeledPairs,scoresOnThoseAuthoredLabels:score,
 elapsedMsNative:Math.round(elapsed),
 isIndependentlyBlindEvaluated:false,rightsClearedPublisherCorpus:false,
 limitations:['Synthetic labels are not independent adjudication.',
 'Approximate MinHash retrieval can miss heavily rewritten sources.',
 'Same text is not proof of shared original measurement.',
 'No public ranking or claim admission is authorized.']};
mkdirSync('evaluation/phase194',{recursive:true});
writeFileSync('evaluation/phase194/synthetic-retrieval-benchmark.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
