// Deterministic replay of uploaded Colab output and source-linked small real excerpts.
// NO new model inference. No claim of independent gold annotations.
import fs from 'node:fs';import crypto from 'node:crypto';
import {analyzeGLiNER25ColabCase159} from '../dist/src/phase159_colab_gliner25_coordinator.js';
import {analyzeEnglishReview156} from '../dist/src/phase156_review_document_engine.js';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const pilot=JSON.parse(fs.readFileSync('research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json','utf8'));
const source=(id,title,url,text,role='original_product_test')=>({document:{text,sha256:hash(text),source:{id,originalDocumentId:id,title,url,role}}});
const samples={
 maytag:{title:'Maytag MRT311FFFE Refrigerator Review',url:'https://www.rtings.com/refrigerator/reviews/maytag/mrt311fffh-black',text:'The unit we bought and tested is an MRT311FFFE, with a black finish.'},
 lg:{title:'LG STUDIO SRFB27W3 Review',url:'https://www.rtings.com/refrigerator/reviews/lg/studio-srfb27w3',text:'The LG STUDIO SRFB27W3 provides great refrigerator capacity.'},
 cosori:{title:'COSORI Dual Blaze Review',url:'https://www.rtings.com/air-fryer/reviews/cosori/dual-blaze-6-8qt-caf-p583s-single-basket',text:'The COSORI Dual Blaze Air Fryer preheats quickly and offers an excellent cooking speed.'},
};
const results={phase:159,kind:'authentic_selectively_chosen_short_editorial_excerpts_no_neural_run',
 publishDate:'2026-10-11',independentAnnotations:false,benchmark:false,cases:{}};
for(const [id,c] of Object.entries(samples)){
 const v=analyzeEnglishReview156(source(id,c.title,c.url,c.text));
 results.cases[id]={sourceUrl:c.url,title:c.title,excerpt:c.text,excerptSha256:hash(c.text),
 wordCount:c.text.split(/\s+/).length,heuristicMentions:v.mentions.map(x=>({surface:x.surface,role:x.role,start:x.span.start,end:x.span.end})),
 candidateMeasurementCount:v.measurements.length,unresolved:v.unresolved,neuralInferencePerformed:false};
}
fs.writeFileSync('PHASE159-REAL-REVIEW-EXCERPT-DIAGNOSTIC.json',JSON.stringify(results,null,2)+'\n');
const coordination={phase:159,modelInferenceInPEE:false,sourceFileSha256:hash(fs.readFileSync('research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json')),
 cases:{}};
for(const [id,v] of Object.entries(pilot.cases)){
 const input=source(id,id==='constructed_fridge'?'Maytag MRT311FFFE diagnostic':'DeLonghi Dedica Duo diagnostic','https://example.org/constructed-diagnostic',v.input);
 const r=analyzeGLiNER25ColabCase159(input,pilot,id);
 coordination.cases[id]={inputSha256:r.documentSha256,neuralSpans:r.neuralSpans,
 modelInterpretations:r.modelInterpretations,featureValueCandidates:r.featureValueCandidates,
 heuristicMentions:r.baseline.mentions.map(m=>({surface:m.surface,start:m.span.start,end:m.span.end,role:m.role})),
 voteDiagnostics:r.voteDiagnostics,reportedInferenceSeconds:r.reportedInferenceSeconds,
 unresolved:r.unresolved,modelQualityBenchmark:false,neuralModelExecutedWithinPEE:false,
 sourceAuthenticated:false,rankingAuthorized:false,canonicalWriteAuthorized:false};
}
fs.writeFileSync('PHASE159-COLAB-COORDINATION-DIAGNOSTIC.json',JSON.stringify(coordination,null,2)+'\n');
console.log('Constructed cases',Object.keys(coordination.cases));
console.log('Real excerpts',Object.fromEntries(Object.entries(results.cases).map(([k,v])=>[k,{mentions:v.heuristicMentions.length,unresolved:v.unresolved}])));
