/** Reproducible developer diagnostic, NOT independent accuracy benchmarking. */
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {discoverEntityInventory153} from '../dist/src/phase153_entity_inventory.js';
import {analyzeEnglishProductDocument154} from '../dist/src/phase154_integrated_review.js';
const examples=[
 ['negation_contrast','We did not test Breville Bambino but we tested Ninja Prestige DualBrew.','Breville Bambino vs Ninja Prestige DualBrew'],
 ['other_category','We compared Samsung QN90D with Sony Bravia 9. Neither claim verifies their identity.','Television comparison'],
 ['coffeemaker','The Sage Barista Touch was not tested. Breville Bambino Plus was evaluated.','Coffee-machine review'],
 ['excluded','Excluding Kenwood MultiPro Compact, the Philips Airfryer Dual Basket is considered.','Kitchen devices'],
 ['missing_sku_challenge','The iRobot Roomba j9+ was excluded from testing.','Robot vacuum review'],
];
const sha=t=>createHash('sha256').update(t).digest('hex');
const doc=(text,title)=>({document:{text,sha256:sha(text),source:{id:'diagnostic',originalDocumentId:'diagnostic',url:'https://example.org/dev-diagnostic',title,role:'original_product_test'}}});
const quantile=(a,q)=>{a=[...a].sort((x,y)=>x-y);return a[Math.floor((a.length-1)*q)]??null};
const samples=examples.map(([id,text,title])=>{
 const input=doc(text,title);const before=discoverEntityInventory153(input);const after=analyzeEnglishProductDocument154(input);
 let samplesBefore=[],samplesAfter=[];for(let i=0;i<60;i++){
  let start=performance.now();discoverEntityInventory153(input);samplesBefore.push(performance.now()-start);
  start=performance.now();analyzeEnglishProductDocument154(input);samplesAfter.push(performance.now()-start);
 }
 return {id,baseline153:before.mentions.map(m=>m.span.literal),phase154:after.mentions.map(m=>({literal:m.literal,context:m.contextCategories})),
  phase154ContextEdges:after.context.edges.length,phase154LFConflict:after.signalDiagnostics.labelConflict,
  expectedDeveloperLimitations:id==='missing_sku_challenge'?['phase153_may_return_partial_name']:[],
  timingsMs:{phase153Median:quantile(samplesBefore,0.5),phase154Median:quantile(samplesAfter,0.5),phase153P95:quantile(samplesBefore,0.95),phase154P95:quantile(samplesAfter,0.95)}};
});
const out={phase:154,evaluation:'developer_constructed_not_source_disjoint',samples,independentGoldAnnotations:0,accuracy:null,recall:null,precision:null,
 qualifier:'Timings reflect this environment, are short-text microbenchmarks and are not a general compute-cost estimate.'};
writeFileSync('PHASE154-CONSTRUCTED-DIAGNOSTIC.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));
