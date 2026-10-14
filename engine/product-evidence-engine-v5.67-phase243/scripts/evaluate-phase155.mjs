/** Read a locally supplied publisher text without redistributing it.
 * Example: node scripts/evaluate-phase155.mjs --file /path/to/authorized-extract.txt
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {analyzeEnglishReview155} from '../dist/src/phase155_review_orchestrator.js';
const p=process.argv.indexOf('--file');
if(p<0||!process.argv[p+1]){process.stderr.write('Pass --file <locally supplied source text>\n');process.exit(2);}
const text=fs.readFileSync(process.argv[p+1],'utf8');
const title=process.argv.includes('--title')?process.argv[process.argv.indexOf('--title')+1]:'Maytag MRT311FFFE Refrigerator Review';
const url=process.argv.includes('--url')?process.argv[process.argv.indexOf('--url')+1]:'https://www.rtings.com/refrigerator/reviews/maytag/mrt311fffh-black';
const doc={document:{text,sha256:createHash('sha256').update(text).digest('hex'),source:{id:'publisher-review-155',originalDocumentId:'publisher-review-155',url,title,role:'original_product_test'}}};
const t0=performance.now();const r=analyzeEnglishReview155(doc);const ms=performance.now()-t0;
const out={phase:r.phase,method:'unblinded_editorial_diagnostic_on_locally_supplied_real_review_excerpts',url,
 sourceDigest:r.documentSha256,characterCount:text.length,elapsedMs:Number(ms.toFixed(2)),
 baseline153RawMentions:r.baseline.mentions.length,review155Mentions:r.mentions.length,
 modelSurfaces:[...new Set(r.mentions.map(m=>m.surface))],
 roleCounts:Object.fromEntries(['reviewed_surface','comparison_surface','variant_surface','unresolved'].map(k=>[k,r.mentions.filter(m=>m.role===k).length])),
 variantRows:r.mentions.filter(m=>m.sources.includes('variant_table')).map(m=>({code:m.surface,reviewedVariantCode:m.reviewedVariantCode})),
 relationProposals:r.relations.map(x=>({object:r.mentions.find(m=>m.id===x.objectMentionId)?.surface,
 relation:x.relation,justification:x.justification,validated:false})),
 measurements:r.measurements.map(m=>({label:m.label.literal,value:m.value,unit:m.unit,assignment:m.assignment,
 assignedTo:r.mentions.find(x=>x.id===m.subjectMentionId)?.surface??null,reportingClass:m.reportingClass})),
 diagnostics:{signalCoverage:r.voteDiagnostics.labelCoverage,signalConflict:r.voteDiagnostics.labelConflict,
 truncated:r.baseline.truncated||r.context.truncated,unresolved:r.unresolved},
 scientificValidation:false,sourceAuthenticated:false,independentlyAnnotated:false,rankingAuthorized:false,canonicalWriteAuthorized:false};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
