/** Constructed deterministic example; NOT real product performance. */
import {writeFileSync} from 'node:fs';
import {InterpretationMemory101,type SourcePointer} from '../src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
import {IncrementalReasoningGraph105,type ProjectionDefinition105} from '../src/phase105_incremental_reasoning_graph.js';
const memory=new InterpretationMemory101();
const cognition=new EntityCognition104();
const graph=new IncrementalReasoningGraph105();
const at=(i:number)=>new Date(Date.UTC(2026,9,11,8,0,i)).toISOString();
const noise={categoryId:'vacuum',criterionId:'noise',frameId:'hard_floor_normal_mode'};
const comfort={categoryId:'vacuum',criterionId:'ergonomics',frameId:'home_daily_use'};
const dep=(variantId:string,f:typeof noise)=>({kind:'belief' as const,variantId,...f});
function add(nodeId:string,kind:ProjectionDefinition105['kind'],dependencies:ProjectionDefinition105['dependencies']){
 return graph.register({nodeId,categoryId:'vacuum',useContextId:'home_daily_use',kind,
   dependencies,engineReference:'phase105 constructed dependency-only sample'});
}
try{
 for(const variantId of ['alpha','beta'])memory.registerProduct({categoryId:'vacuum',variantId,displayName:`Demo ${variantId}`});
 add('noise_comparison','comparison',[dep('alpha',noise),dep('beta',noise)]);
 add('ergonomics_comparison','comparison',[dep('alpha',comfort),dep('beta',comfort)]);
 add('overall_tradeoff','personalized_tradeoff',[
  {kind:'derived',nodeId:'noise_comparison'},{kind:'derived',nodeId:'ergonomics_comparison'}]);
 add('tradeoff_explanation','explanation',[{kind:'derived',nodeId:'overall_tradeoff'}]);
 let i=0;
 for(const frame of [noise,comfort])for(const variant of ['alpha','beta'])
   cognition.synchronize(memory.snapshotReviewedFrame(frame),variant,at(++i));
 graph.replay(cognition);
 for(const id of ['noise_comparison','ergonomics_comparison','overall_tradeoff','tradeoff_explanation'])
   graph.acknowledgeComputed(id,cognition,'b'.repeat(64),graph.checkpoint().sequence);
 const source:SourcePointer={sourceUrl:'https://publisher.example.org/lab',originalTestId:'test_1',
  sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'c'.repeat(64),sourceLocator:'#noise',
  methodologyReference:'independent original methodology documented',
  assessmentReference:'independent human review receipt recorded',assessorId:'reviewer_1',
  assessedAt:at(1),originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true};
 memory.recordApprovedClaim({...noise,id:'claim_noise_1',variantId:'alpha',kind:'descriptor',
   descriptor:'somewhat_noisy',qualifier:'reviewer_relative',source});
 cognition.synchronize(memory.snapshotReviewedFrame(noise),'alpha',at(++i));
 const update=graph.replay(cognition);
 const payload={constructed:true,kind:'incremental_knowledge_invalidation',
  eventCount:cognition.verifyJournal().events,update,
  affectedNodes:graph.pending().map(x=>({nodeId:x.definition.nodeId,state:x.state,
    triggers:x.triggeringEvidenceKeys})),
  unaffectedErgonomics:graph.get('ergonomics_comparison'),
  sourceTextRequired:false,llmCalls:0,publicationReady:false};
 const output=process.argv[2];if(output)writeFileSync(output,JSON.stringify(payload,null,2)+'\n');
 else console.log(JSON.stringify(payload,null,2));
}finally{graph.close();cognition.close();memory.close();}
