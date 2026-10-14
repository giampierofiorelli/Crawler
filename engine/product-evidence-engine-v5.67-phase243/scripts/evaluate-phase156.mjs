/** Evaluate locally supplied, authorized publisher text; never emits publisher paragraphs. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {analyzeEnglishReview155} from '../dist/src/phase155_review_orchestrator.js';
import {analyzeEnglishReview156} from '../dist/src/phase156_review_document_engine.js';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:undefined;};
const file=arg('--file'),title=arg('--title'),url=arg('--url');
if(!file||!title||!url){console.error('Use --file, --title, --url. No network fetching.');process.exit(2);}
const text=readFileSync(file,'utf8'),sha=s=>createHash('sha256').update(s).digest('hex');
const input={document:{text,sha256:sha(text),source:{id:'locally-supplied-review',originalDocumentId:'locally-supplied-review',url,title,role:'original_product_test'}}};
let start=performance.now(),old=analyzeEnglishReview155(input),oldTime=performance.now()-start;
start=performance.now();const current=analyzeEnglishReview156(input);const currentTime=performance.now()-start;
const summary={phase:156,method:'developer_selected_real_publisher_text_windows_not_full_reviews_not_blind',
 url,title,sourceDigest:sha(text),characters:text.length,windows:current.windowCount,
 old:{mentions:old.mentions.map(x=>x.surface),relations:old.relations.length,measurements:old.measurements.length,elapsedMs:+oldTime.toFixed(2)},
 current:{mentions:current.mentions.map(x=>({surface:x.surface,role:x.role,context:x.contextCategories})),
  documentVertices:current.documentGraph.vertices.length,documentEdges:current.documentGraph.edges.length,
  relations:current.relations.length,measurements:current.measurements.map(x=>({label:x.label.literal,value:x.value,unit:x.unit,reportingClass:x.reportingClass})),
  discardedOverlapCount:current.discardedOverlapCount,unresolved:current.unresolved,elapsedMs:+currentTime.toFixed(2)},
 reviewTextRedistributed:false,independentlyAnnotated:false,qualityMetricsAvailable:false,rankingAuthorized:false};
console.log(JSON.stringify(summary,null,2));
