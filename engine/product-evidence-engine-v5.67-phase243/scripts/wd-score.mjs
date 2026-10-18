/**
 * Whole-document evaluation scorer (WD, 2026-10-18), written before the first run. Protocol:
 * evaluation/whole-document/protocol.json. Called by scripts/wd-eval.mjs run ARM LABEL.
 *
 * Arms (each from its own frozen build root, PEE_WD_BUILD):
 *   a  the live readers (Phase245 declarations, Phase225/265 test leads, Phase270 comparative results, Phase269 codes)
 *   b  the knowledge layer as it was (1G tables + quantity knowledge), tables only
 *   c  the whole-document reader (src/document_evidence.ts)
 * Matching: a reader item matches a reference quantity on the same page when it maps to the same rendered line (or data
 * path) and its surface has the same numbers and unit after normalisation. Public output: counts only. Private output:
 * rows of ids and categories, no page text.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[‐-―−]/g,'-').replace(/\s+/g,' ').trim();
const nums=s=>(norm(s).replace(/(\d),(\d{3})/g,'$1$2').match(/\d+(?:\.\d+)?/g)??[]).map(Number);
const unitOf=s=>norm(s).replace(/(\d),(\d{3})/g,'$1$2').replace(/[\d.\s,~≈<>+-]/g,'').replace(/^(?:sub|upto|about)/,'');
/** b is the reference surface. A dimension list ("30 x 20 x 10 cm") is one reference item; a reader that prints its
 * elements separately reaches it with any of them. */
export function sameSurface(a,b){const na=nums(a),nb=nums(b);if(!na.length)return false;
 if(nb.length>1&&/\d\s*[x×]\s*\d/i.test(norm(b)))return na.every(x=>nb.includes(x));
 if(na.length!==nb.length||na.some((x,i)=>x!==nb[i]))return false;
 const ua=unitOf(a),ub=unitOf(b);return ua===ub||!ua||!ub||ua.includes(ub)||ub.includes(ua);}
const toks=s=>new Set(norm(s).split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1));
const overlap=(a,b)=>{const A=toks(a),B=toks(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.min(A.size,B.size);};
/** Product names agree when they share a model token (letters and digits), or, without model tokens, most words. */
export function sameProduct(a,b){if(!a||!b)return false;const A=toks(a),B=toks(b);const mA=[...A].filter(x=>/\d/.test(x)&&/[a-z]/.test(x)),mB=[...B].filter(x=>/\d/.test(x)&&/[a-z]/.test(x));
 if(mA.length&&mB.length)return mA.some(x=>B.has(x))||mB.some(x=>A.has(x));let n=0;for(const x of A)if(B.has(x))n++;return n/Math.min(A.size,B.size)>=0.6;}
const NONQ=new Set(['identifier_or_name_part','warranty_or_service','other_non_quantity','price']);

/** The rendered line (or data path) a reader item comes from: the non-table line holding its numbers with the most words
 * of its segment text in common. */
function lineFinder(page){const lines=page.lines.filter(l=>!l.inTable);const byPath=new Map();for(const d of page.data)byPath.set(d.path,[...(byPath.get(d.path)??[]),d]);
 return (item)=>{if(item.path!==undefined){const ds=byPath.get(item.path)??[];const d=ds.find(x=>!item.surface||nums(x.text).some(n=>nums(item.surface).includes(n)))??ds[0];return d?d.n:null;}
  // Scorer correction (2026-10-18, after the first run, same frozen builds; label "first-scorerfix"): the first version
  // normalised the word overlap by the SHORTER text, so a three-word line inside a paragraph scored 1 and won. A value is
  // now placed on the line that holds its numbers and most of its own context window; a statement on the line that
  // shares most words with it relative to the longer of the two.
  let best=null,score=0;const C=toks(item.context??'');
  for(const l of lines){if(item.surface&&!nums(item.surface).every(n=>nums(l.text).includes(n)))continue;const L=toks(l.text);let n=0;for(const x of C)if(L.has(x))n++;
   const o=item.surface?(C.size?n/C.size:0)+(norm(l.text).includes(norm(item.surface))?0.5:0):(C.size&&L.size?n/Math.max(C.size,L.size):0);
   if(o>score){score=o;best=l.n;}}return score>=0.3?best:null;};}

async function armItems(arm,root,page,html){
 const D=join(resolve(root),'dist/src');const find=lineFinder(page);
 if(arm==='c'){const Q=await import(D+'/quantity_knowledge.js');const W=await import(D+'/document_evidence.js');const qk=Q.loadQuantityKnowledge();
  const r=W.readDocumentEvidence(html,qk,{sourceType:page.sourceType});const seg=new Map(r.segments.map(s=>[s.id,s]));
  const quantities=r.quantities.map(q=>{const s=seg.get(q.segment);const ctx=s.text.slice(Math.max(0,q.start-120),q.end+60);
   const line=s.embedded?find({path:s.embedded.path,surface:q.surface}):find({surface:q.surface,context:(s.label??'')+' '+ctx});
   return {id:q.id,line,surface:q.surface,kind:q.identifierPart?null:q.quantity?.kind.id??null,metric:q.quantity?.metric.id??null,product:q.product,productIsSubject:!!q.product&&q.product===r.pageSubject,
    conditions:(q.quantity?.conditions??[]).map(c=>({axis:c.axis,value:c.value})),evidenceClass:q.evidenceClass,identifierPart:q.identifierPart,location:s.location,region:s.region,typed:!!q.quantity};});
  const qualitative=r.qualitative.map(o=>{const s=seg.get(o.segment);return {id:o.id,line:s.embedded?find({path:s.embedded.path}):find({context:s.text}),aspect:o.aspect,aspectTerms:qk.pack.aspects.find(a=>a.id===o.aspect)?.terms??[],
   polarity:o.polarity,product:o.product,productIsSubject:!!o.product&&o.product===r.pageSubject,conditions:o.conditions,basis:o.basis};});
  return {quantities,qualitative,subject:r.pageSubject,readingIdentity:r.readingIdentity};}
 if(arm==='b'){const Q=await import(D+'/quantity_knowledge.js');const K=await import(D+'/table_interpreter1g_knowledge.js');const qk=Q.loadQuantityKnowledge();const r=K.interpretWithKnowledge1G(html,qk);
  // tables only: table lines are outside the reference's scope, so these items match only a value printed outside tables too
  const quantities=r.tables.flatMap(t=>t.observations.filter(o=>o.quantity).map(o=>({id:o.id,line:find({surface:o.surface,context:[...o.property,o.surface].join(' ')}),surface:o.surface,kind:o.quantity.kind.id,metric:o.quantity.metric.id,product:o.product,productIsSubject:false,
   conditions:o.quantity.conditions.map(c=>({axis:c.axis,value:c.value})),evidenceClass:o.evidence.class,identifierPart:false,location:'table',region:'subject',typed:true})));
  return {quantities,qualitative:[],subject:null,readingIdentity:r.readingIdentity};}
 if(arm==='a'){const S=await import(D+'/phase245_spec_extraction.js');const T=await import(D+'/phase265_test_measurements.js');const C7=await import(D+'/phase270_comparative_results.js');const Q9=await import(D+'/phase269_qualitative_observations.js');
  const x=S.extractSpecifications245(html,page.url);const main=x.mainProduct?.name??null;const quantities=[];
  for(const f of x.facts){const v=f.value;if(!v||!['quantity','range','dimensions','number'].includes(v.kind))continue;const surface=f.rawValue??'';
   quantities.push({id:'f'+quantities.length,line:find({surface,context:(f.property??'')+' '+surface}),surface,kind:null,metric:null,product:f.product?.name??main,productIsSubject:(f.product?.ref??'main')==='main',conditions:[],evidenceClass:'manufacturer_declared',identifierPart:false,location:'spec',region:'subject',typed:false});}
  const st=page.sourceType==='independent_review'?'independent_original_test':page.sourceType;const leads=T.testLeadsFromHtml265(html,page.url,page.sha256,T.testDocumentSubject268(x,st)).probe.candidates;
  for(const l of leads){const surface=`${l.value} ${l.unit}`;quantities.push({id:'l'+quantities.length,line:find({surface,context:surface}),surface,kind:null,metric:null,product:main,productIsSubject:true,conditions:[],evidenceClass:'publisher_measured',identifierPart:false,location:'lead',region:'subject',typed:false});}
  for(const c of C7.comparativeResults270(html).results){const surface=`${c.value} ${c.unit??''}`;quantities.push({id:'c'+quantities.length,line:find({surface,context:surface}),surface,kind:null,metric:null,product:null,productIsSubject:false,conditions:[],evidenceClass:'publisher_measured',identifierPart:false,location:'comparative',region:'subject',typed:false});}
  const q9=Q9.qualitativeObservations269(html);const obs=q9.observations??q9;
  const qualitative=(Array.isArray(obs)?obs:[]).map((o,i)=>({id:'o'+i,line:null,aspect:o.outcome,aspectTerms:[o.outcome],polarity:o.direction,product:main,productIsSubject:true,conditions:[],basis:'tested_experience'}));
  return {quantities,qualitative,subject:main,readingIdentity:'live readers'};}
 throw Error('unknown arm '+arm);}

export async function runArm(arm,label,ctx){
 if(!['a','b','c'].includes(arm)||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: run a|b|c LABEL  (PEE_WD_BUILD=<engine root of the frozen build>)');
 const root=process.env.PEE_WD_BUILD??'.';const pub=join(ctx.PUB,`score-${label}-arm-${arm}.json`),priv=join(ctx.PRIV,`run-${label}-arm-${arm}.json`);
 for(const f of [pub,priv])if(existsSync(f))throw Error(f+' exists: never overwritten');
 const freeze=JSON.parse(readFileSync(join(ctx.PUB,'gold-freeze.json'),'utf8'));
 for(const g of freeze.files)if(sha(readFileSync(join(ctx.WD,'gold',g.file)))!==g.sha256)throw Error('reference changed since sealing: '+g.file);
 if(sha(readFileSync(join(ctx.WD,'annotation-input.json')))!==freeze.annotationInputSha256)throw Error('annotation input changed');
 const input=JSON.parse(readFileSync(join(ctx.WD,'annotation-input.json'),'utf8'));const axes=new Set(input.knowledge.conditionAxes.map(a=>a.id));
 const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const per={};const rows=[];const qrows=[];let ident=null;
 for(const p of ctx.pagesOf(ctx.KV)){const page={...input.pages[p.tag],url:p.finalUrl??p.url,sha256:p.sha256};const gold=JSON.parse(readFileSync(join(ctx.WD,'gold',p.tag+'.json'),'utf8'));
  const out=await armItems(arm,root,page,p.html);ident=out.readingIdentity;const P=per[p.tag]={};const pinc=(k,n=1)=>{P[k]=(P[k]??0)+n;inc(k,n);};
  const used=new Set();
  for(const [gi,g] of gold.quantities.entries()){if(g.duplicateOf){pinc('ref_duplicates');continue;}
   const isData=String(g.line).startsWith('d');pinc('ref_quantities');pinc(isData?'ref_in_data':'ref_in_text');pinc('ref_class_'+g.class);
   const m=out.quantities.find(q=>!used.has(q.id)&&String(q.line)===String(g.line)&&sameSurface(q.surface,g.surface));
   const row={page:p.tag,ref:gi,class:g.class,line:g.line,reader:m?.id??null};rows.push(row);
   if(!m){pinc('not_reached');pinc('not_reached_'+(NONQ.has(g.class)?'non_quantity':'quantity'));row.stage='not_reached';continue;}
   used.add(m.id);if(nums(g.surface).length>1)for(const q of out.quantities)if(String(q.line)===String(g.line)&&sameSurface(q.surface,g.surface))used.add(q.id);pinc('reached');pinc('reached_at_'+m.location);row.location=m.location;
   if(NONQ.has(g.class)){const wrong=!!m.kind&&!m.identifierPart;row.stage=wrong?'non_quantity_typed':'non_quantity_ok';pinc(row.stage);if(wrong)pinc('wrong_conclusion');continue;}
   const gk=g.kind;const determinable=gk&&gk!=='not_determinable_from_page'&&gk!=='not_a_quantity';
   row.kind=determinable?(m.kind===gk?'correct':m.kind?'unjustified_interpretation':'unjustified_abstention'):(m.kind?'unjustified_interpretation':'justified_abstention');
   pinc('kind_'+row.kind);if(m.kind)pinc('interpreted');else pinc('reached_not_interpreted');
   row.product=g.product==='none_or_unclear'?(m.product?'attributed_where_reference_unclear':'justified_none'):
    !m.product?'missing':(g.product==='page_subject'?(m.productIsSubject||sameProduct(m.product,out.subject)?'correct':'wrong'):sameProduct(m.product,g.product)?'correct':'wrong');
   pinc('product_'+row.product);
   row.metric=g.metric?(m.metric===g.metric?'correct':m.metric?'wrong':'missing'):(m.metric?'extra':'none_expected');pinc('metric_'+row.metric);
   const gc=g.conditions??[];
   for(const c of gc){const ok=m.conditions.some(r=>r.axis===c.axis||(!axes.has(c.axis)&&(nums(r.value).some(n=>nums(c.value).includes(n))||overlap(r.value,c.value)>=0.5)));pinc(ok?'condition_attributed':'condition_not_attributed');if(!axes.has(c.axis))pinc('condition_free_label');}
   for(const r of m.conditions)if(!gc.some(c=>c.axis===r.axis||nums(r.value).some(n=>nums(c.value).includes(n))))pinc('condition_spurious');
   row.evidence=m.evidenceClass===g.evidenceClass?'correct':m.evidenceClass==='unknown'||!m.evidenceClass?'missing':'wrong';pinc('evidence_'+row.evidence);
   if(row.kind==='unjustified_interpretation'||row.product==='wrong'||row.metric==='wrong'||row.evidence==='wrong'){pinc('wrong_conclusion');row.wrong=true;}}
  for(const q of out.quantities)if(!used.has(q.id)){pinc('reader_unmatched');if(q.typed&&q.region==='subject')pinc('reader_unmatched_typed');}
  const usedO=new Set();const agrees=(o,g)=>o.aspectTerms.some(t=>norm(g.aspect).includes(norm(t)))||norm(g.aspect).includes(norm(o.aspect).replace(/_/g,' '));
  for(const [gi,g] of (gold.qualitative??[]).entries()){pinc('ref_qualitative');
   const cands=out.qualitative.filter(o=>!usedO.has(o.id)&&String(o.line)===String(g.line)).sort((x,y)=>(agrees(y,g)?1:0)-(agrees(x,g)?1:0));const m=cands[0];
   const row={page:p.tag,ref:gi,line:g.line,reader:m?.id??null};qrows.push(row);
   if(!m){pinc('qual_not_reached');continue;}usedO.add(m.id);pinc('qual_reached');
   row.aspect=agrees(m,g)?'agrees':'differs';pinc('qual_aspect_'+row.aspect);
   row.polarity=m.polarity===g.polarity?'correct':'wrong';pinc('qual_polarity_'+row.polarity);
   row.product=g.product==='none_or_unclear'?(m.product?'attributed_where_reference_unclear':'justified_none'):!m.product?'missing':(g.product==='page_subject'?(m.productIsSubject?'correct':'wrong'):sameProduct(m.product,g.product)?'correct':'wrong');pinc('qual_product_'+row.product);
   row.basis=m.basis===g.basis?'correct':'wrong';pinc('qual_basis_'+row.basis);
   for(const c of g.conditions??[])pinc(m.conditions.some(r=>r.axis===c.axis||overlap(r.value,c.value)>=0.5)?'qual_condition_attributed':'qual_condition_not_attributed');}
  for(const o of out.qualitative)if(!usedO.has(o.id))pinc('qual_reader_unmatched');}
 const meta={protocol:'evaluation/whole-document/protocol.json',arm,label,build:process.env.PEE_WD_BUILD?'frozen build '+process.env.PEE_WD_BUILD_COMMIT:'working tree',readingIdentity:ident,generatedAt:new Date().toISOString(),
  tier:'T2 authentic new (non-table content of the KV pages); first run unless the label says tuned'};
 mkdirSync(ctx.PUB,{recursive:true});mkdirSync(ctx.PRIV,{recursive:true});
 writeFileSync(pub,JSON.stringify({...meta,counts:C,perPage:per},null,1)+'\n');writeFileSync(priv,JSON.stringify({...meta,counts:C,rows,qualitative:qrows},null,1)+'\n');
 console.log(JSON.stringify(C,null,1));console.log('wrote',pub,priv);}
