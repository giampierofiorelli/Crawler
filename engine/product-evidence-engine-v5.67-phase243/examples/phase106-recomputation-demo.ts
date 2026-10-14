/** Constructed evidence-only demonstration, not real consumer product data. */
import {writeFileSync} from 'node:fs';
import {InterpretationMemory101,type SourcePointer} from '../src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
import {IncrementalReasoningGraph105} from '../src/phase105_incremental_reasoning_graph.js';
import {ResearchRecomputation106,phase106EngineReferences}
 from '../src/phase106_recomputation_worker.js';
const memory=new InterpretationMemory101(),mind=new EntityCognition104(),graph=new IncrementalReasoningGraph105();
const worker=new ResearchRecomputation106(memory,mind,graph);
const frame={categoryId:'vacuum',criterionId:'noise',frameId:'normal_mode'};
const dep=(variantId:string)=>({kind:'belief' as const,variantId,...frame});
const date=(s:number)=>new Date(Date.UTC(2026,9,11,10,0,s)).toISOString();
const source=(originalTestId:string):SourcePointer=>({sourceUrl:`https://example.org/original/${originalTestId}`,
 originalTestId,sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),
 sourceLocator:'#method',methodologyReference:'fictional independently labelled method',
 assessmentReference:'fictional primary evidence validation receipt',assessorId:'example_assessor',
 assessedAt:date(0),originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
try{
 for(const variantId of ['alpha','beta','gamma'])memory.registerProduct({categoryId:'vacuum',variantId,displayName:'Example '+variantId});
 graph.register({nodeId:'compare_alpha_beta',categoryId:'vacuum',useContextId:'home_cleaning',kind:'comparison',
  dependencies:[dep('alpha'),dep('beta')],engineReference:phase106EngineReferences.comparison});
 graph.register({nodeId:'explain_alpha_beta',categoryId:'vacuum',useContextId:'home_cleaning',kind:'explanation',
  dependencies:[{kind:'derived',nodeId:'compare_alpha_beta'}],engineReference:phase106EngineReferences.explanation});
 memory.recordApprovedClaim({...frame,id:'evidence_one',variantId:'alpha',kind:'pairwise',
  comparedVariantId:'beta',relation:'better',comparisonBasis:'same_original_test',source:source('test_one')});
 const initial=worker.recompute('explain_alpha_beta',date(1));
 const stable=worker.readFresh('explain_alpha_beta');
 const originalPairDigest=worker.readFresh('compare_alpha_beta')?.resultSha256;
 memory.recordApprovedClaim({...frame,id:'unrelated',variantId:'gamma',kind:'descriptor',
   descriptor:'very_noisy',qualifier:'reviewer_relative',source:source('test_gamma')});
 const unaffected=worker.readFresh('compare_alpha_beta')?.resultSha256===originalPairDigest;
 memory.recordApprovedClaim({...frame,id:'evidence_two',variantId:'beta',kind:'pairwise',
  comparedVariantId:'alpha',relation:'better',comparisonBasis:'same_original_test',source:source('test_two')});
 const staleIsBlocked=worker.readFresh('explain_alpha_beta')===null;
 const revised=worker.recompute('explain_alpha_beta',date(2));
 const artifact={constructed:true,phase:106,
  originalTextStored:false,modelCalls:0,publishable:false,
  initial:{status:initial.status,projection:initial.result?.payload,resultSha256:initial.result?.resultSha256},
  secondLookupSameCache:stable?.resultSha256===initial.result?.resultSha256,
  unaffectedByUnrelatedProduct:unaffected,
  staleReadBlocked:staleIsBlocked,
  afterConflictingTest:{status:revised.status,projection:revised.result?.payload},
  eventCount:mind.verifyJournal().events,
  invalidationHistory:graph.invalidationHistory('explain_alpha_beta')};
 if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(artifact,null,2)+'\n');
 else console.log(JSON.stringify(artifact,null,2));
}finally{graph.close();mind.close();memory.close();}
