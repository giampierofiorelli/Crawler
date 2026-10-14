import {readFileSync,writeFileSync} from 'node:fs';
import {nativeMeasurementNameObserver129} from '../dist/src/phase129_category_growth_cycle.js';
import {nativeScientificExtractor130} from '../dist/src/phase130_native_scientific_reader.js';
const path=process.argv[2]??'evaluation/phase130/frozen_corpus.json';
const corpus=JSON.parse(readFileSync(path,'utf8'));
const norm=s=>s.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const algorithms=[['baseline_phase129',nativeMeasurementNameObserver129()],['native_phase130',nativeScientificExtractor130()]];
const all={corpusId:path.includes('postfreeze')?'phase130_postfreeze_challenge':'phase130_frozen_development',cases:corpus.cases.length,
 caveat:'Curated human-written restatements and synthetic adversarial decoys. No live raw-page crawl, blinded annotation or open-domain validation.',results:{}};
for(const [name,extractor] of algorithms){
 let tp=0,fp=0,fn=0,exactCases=0;const cases=[];
 for(const e of corpus.cases){
  const src={id:e.id,originalDocumentId:e.id+'_source',url:e.source,title:e.id,role:e.sourceRole};
  const candidates=await extractor.propose({source:src,text:e.text});
  const predicted=[...new Set(candidates.map(x=>norm(x.concept.label)))].sort();
  const expected=[...new Set(e.expected.map(norm))].sort();
  const correct=predicted.filter(x=>expected.includes(x));
  tp+=correct.length;fp+=predicted.filter(x=>!expected.includes(x)).length;
  fn+=expected.filter(x=>!predicted.includes(x)).length;
  const exact=JSON.stringify(predicted)===JSON.stringify(expected);if(exact)exactCases++;
  cases.push({id:e.id,expected,predicted,correct,exact,
   source:e.source,sourceMode:e.group==='adversarial_constructed'?'synthetic':'curated_official_source_summary'});
 }
 all.results[name]={tp,fp,fn,precision:tp+fp?tp/(tp+fp):null,
  recall:tp+fn?tp/(tp+fn):null,exactCases,caseCount:corpus.cases.length,cases};
}
writeFileSync(path.includes('postfreeze')?'PHASE130-POSTFREEZE-CHALLENGE-RESULTS.json':'PHASE130-FROZEN-CORPUS-DIAGNOSTIC.json',JSON.stringify(all,null,2)+'\n');
console.log(JSON.stringify({dataset:all.corpusId,baseline:(({tp,fp,fn,precision,recall,exactCases})=>({tp,fp,fn,precision,recall,exactCases}))(all.results.baseline_phase129),phase130:(({tp,fp,fn,precision,recall,exactCases})=>({tp,fp,fn,precision,recall,exactCases}))(all.results.native_phase130)},null,2));
