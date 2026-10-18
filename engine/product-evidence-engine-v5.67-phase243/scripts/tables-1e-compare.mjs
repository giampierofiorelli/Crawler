#!/usr/bin/env node
/** Table understanding, Stage C (development pages only; no network).
 *   packets            for every table of evaluation/tables-1e/sample.json: a source-level cell listing (row/cell order, tag, spans,
 *                      scope, headers attribute, text), the table's heading chain and section text, and a plain-text rendering of
 *                      its page, written to the PRIVATE evaluation directory for the separate annotator. No PEE output is included.
 *   compare LABEL      mechanical comparison of the sealed annotations (private annotations.json, hash in
 *                      evaluation/tables-1e/annotation-freeze.json) with PEE: the decision ledger and the arm C leads (the
 *                      frozen Step 1D-A2 candidate) of the same cells; per element: read correct, wrong product, unresolved,
 *                      not read (with every blocker and the earliest stage), false measurement; plus axis and context
 *                      agreement. Private full result and public value-free result; never overwritten. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {documentLeads,buildIdentity} from './experience-observe.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const [cmd,label,...rest]=process.argv.slice(2);const ARG=k=>{const i=rest.indexOf('--'+k);return i>=0?rest[i+1]:null;};
// Stage D: the PEE side may be the lesson-enabled shadow reader (--policy candidate_1e_tables [--lessons a,b]); default the frozen arm C.
const POLICY=ARG('policy')??'candidate_1c_semantics_tables';const LESSONS=ARG('lessons')?ARG('lessons').split(','):null;
const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');const P=join(ROOT,'tables-1e');const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const PUBD='evaluation/tables-1e';const D=resolve('dist/src');
const H=await import(D+'/phase245_html_dom.js');const G=await import(D+'/phase245_table_grid.js');const SEM=await import(D+'/document_semantics.js');
const B=await import(D+'/phase225_transient_test_probe.js');const PL=await import(D+'/phase272_extraction_plan.js');const L=await import(D+'/table_ledger1e.js');
const S=await import(D+'/experience_attribution_scoring.js');const ST=await import(D+'/phase246_knowledge_store.js');const R=await import(D+'/phase248_category_registry.js');
const SAMPLE=JSON.parse(readFileSync(join(PUBD,'sample.json'),'utf8'));
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const pageOf=key=>{const [ev,tag]=key.split('/');const W=JSON.parse(readFileSync(join(ROOT,ev,'wave.json'),'utf8'));const p=W.pages.find(x=>x.tag===tag);
 const b=readFileSync(join(ROOT,ev,'raw',tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+key);return {ev,tag,url:p.finalUrl??p.url,sha256:p.sha256,html:b.toString('utf8'),category:p.category};};
/** The DOM table node of semantic table index k (same skips as the contract: nested, no grid, more than 40). */
function tableNode(root,k){let i=0;for(const n of H.walk245(root)){if(n.kind!=='element'||n.tag!=='table')continue;let a=n.parent,nested=false;while(a){if(a.tag==='table'){nested=true;break;}a=a.parent;}if(nested)continue;
 if(!G.buildTableGrid245(n)||i>=40)continue;if(i===k)return n;i++;}return null;}
const dec=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n)).replace(/&quot;/g,'"').replace(/&#039;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const renderText=html=>dec(html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|svg|noscript|iframe|template)\b[\s\S]*?<\/\1\s*>/gi,'')
 .replace(/<h[1-6]\b[^>]*>/gi,'\n## ').replace(/<\/h[1-6]>/gi,'\n').replace(/<tr\b[^>]*>/gi,'\n|').replace(/<\/t[hd]>/gi,' |').replace(/<(p|li|br|div|section|article|figcaption|caption)\b[^>]*>/gi,'\n')
 .replace(/<[^>]+>/g,' ')).split('\n').map(x=>x.replace(/[ \t]+/g,' ').trim()).filter(Boolean).join('\n');

if(cmd==='packets'){
 mkdirSync(join(P,'packets'),{recursive:true});const pagesDone=new Set();
 for(const s of SAMPLE.tables){const p=pageOf(s.page);const {root}=H.parseHtml245(p.html);const n=tableNode(root,s.table);if(!n)throw Error('table not found '+s.id);
  const trs=[];const visit=x=>{for(const c of x.children){if(c.kind!=='element'||c.tag==='table')continue;if(c.tag==='tr')trs.push(c);else visit(c);}};visit(n);
  const rows=trs.map((tr,r)=>tr.children.filter(c=>c.kind==='element'&&(c.tag==='td'||c.tag==='th')).map((c,k)=>({r,c:k,tag:c.tag,rowspan:c.attrs.rowspan??null,colspan:c.attrs.colspan??null,scope:c.attrs.scope??null,headers:c.attrs.headers??null,text:H.textOf245(c,{skip:x=>x.tag==='table'})})));
  const cap=n.children.find(c=>c.kind==='element'&&c.tag==='caption');
  // Heading chain and section text: the reader blocks of the table's section before it, and up to 3 blocks after it.
  const sem=SEM.readDocumentSemantics1D2(p.html,p.url);const deep=B.textBlocks225(p.html,{maxBlocks:1500}).blocks;const st=sem.tables[s.table];
  const bis=st.cells.map(c=>c.blockIndex).filter(x=>x!==null);const first=Math.min(...bis),last=Math.max(...bis);
  const path=Number.isFinite(first)?sem.blocks[first].headingPath:[];const head=path[path.length-1]??Math.max(0,first-8);
  const before=[];for(let b=head+1;b<first&&before.length<12;b++)if(!sem.blocks[b].cell)before.push(deep[b]);
  const after=[];for(let b=last+1;b<deep.length&&after.length<3;b++){if(sem.blocks[b].cell)continue;if(/^h[1-6]$/.test(sem.blocks[b].tag))break;after.push(deep[b]);}
  const textFile=`page-${p.ev}-${p.tag}.txt`;if(!pagesDone.has(s.page)){writeFileSync(join(P,'packets',textFile),`URL: ${p.url}\nCATEGORY: ${p.category}\n\n${renderText(p.html)}\n`);pagesDone.add(s.page);}
  writeFileSync(join(P,'packets',s.id+'.json'),JSON.stringify({id:s.id,url:p.url,category:s.category,pageTitle:sem.metadata.title,h1:sem.metadata.h1[0]??null,
   headingChain:path.map(i=>deep[i]),caption:cap?H.textOf245(cap):null,sectionTextBefore:before,textAfter:after,fullPageText:textFile,cells:rows.flat()},null,1)+'\n');
  console.log(s.id,rows.flat().length,'cells');}
 process.exit(0);}

if(cmd!=='compare'||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: packets | compare LABEL');
const PRIV=join(REPO,'private-eval/tables-1e',`compare-${label}.json`),PUB=join(PUBD,`compare-${label}.json`);for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const ab=readFileSync(join(P,'annotations.json'));const AF=JSON.parse(readFileSync(join(PUBD,'annotation-freeze.json'),'utf8'));if(sha(ab)!==AF.annotationsSha256)throw Error('annotations differ from the sealed hash');
const A=JSON.parse(ab);const store=new ST.KnowledgeStore246(LIVE);const plans={};
const planOf=c=>c in plans?plans[c]:(plans[c]=TAUGHT.includes(c)?PL.compileExtractionPlan272(store,c,R.CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[],TAUGHT.filter(t=>t!==c)):null);
const UE={db:['db','dba','db(a)','decibels'],nits:['nits','nit','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs','sec'],hours:['hours','hrs','h','hr'],'%':['%','percent'],l:['l','litres','liters','litre'],w:['w','watts','watt'],kwh:['kwh'],ms:['ms'],cfm:['cfm'],kw:['kw']};
const canon=u=>{if(!u)return null;const l=String(u).toLowerCase().trim();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return PL.canonicalUnit272(l)??l;};
const impliedAxes=m=>m==='products_in_columns'?{row:'property',col:'product'}:m==='products_in_rows'?{row:'product',col:'property'}:m==='key_value'?{row:'property',col:'none'}:{row:'none',col:'none'};
const MEASURED=k=>k==='measured';const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});
const out=[];const leadCache={};
for(const s of SAMPLE.tables){const a=A.tables.find(t=>t.id===s.id);if(!a)throw Error('no annotation for '+s.id);
 const p=pageOf(s.page);const plan=planOf(p.category);const sem=SEM.readDocumentSemantics1D2(p.html,p.url);const deep=B.textBlocks225(p.html,{maxBlocks:1500}).blocks;
 const lessons=POLICY==='candidate_1e_tables'?(LESSONS??(await import(D+'/table_lessons1e.js')).activeTableLessons1E(['promoted','provisional'])):undefined;
 const led=L.tableLedger1E(sem,plan,{sourceUrl:p.url,documentSha256:p.sha256,blocks:deep,documentReportsTesting:deep.some(b=>PL.TEST_CONTEXT272.test(b)),html:p.html,...(lessons?{lessons}:{})});
 const lt=led.tables.find(t=>t.table===s.table);
 let leads=[];if(plan){leadCache[s.page]??=(await documentLeads(D,{evaluation:p.ev,docTag:p.tag,category:p.category},{policy:POLICY,details:true,...(lessons?{lessons}:{})})).leads;leads=leadCache[s.page];}
 const cellOf=(r,c)=>lt.cells.find(x=>x.sourceRow===r&&x.sourceCell===c)??null;
 const elements=[];
 for(const ac of a.cells??[])for(const ae of ac.elements??[]){const lc=cellOf(ac.r,ac.c);
  const le=lc?.elements.find(e=>e.value!==null&&Math.abs(e.value-ae.value)<1e-9&&(!ae.surface||lc.text.includes(String(ae.surface).trim())?true:true))??null;
  const peeLeads=lc&&lc.blockIndex!==null?leads.filter(l=>l.blockIndex===lc.blockIndex&&Math.abs(l.value-ae.value)<1e-9):[];
  const unit=canon(ae.unit);const goldS={subject:ae.product,subjectStatus:'exact',acceptedVariants:[],id:'',doc:'',value:0,unit:''};
  let cls;const lead=peeLeads[0]??null;
  if(MEASURED(ae.kind)){if(!lead)cls='not_read';else if(!lead.subject)cls='read_unresolved';else if(ae.product&&S.identity1C(goldS,lead.subject)==='match')cls=unit&&lead.unit!==unit?'read_correct_product_unit_differs':'read_correct';else cls=ae.product?'read_wrong_product':'read_subject_not_established_by_source';}
  else cls=lead?'read_as_measurement_but_'+ae.kind:'not_read_'+ae.kind;
  elements.push({id:s.id,r:ac.r,c:ac.c,kind:ae.kind,dimension:ae.dimension??null,uncertain:!!ae.uncertain,conditions:ae.conditions??[],cls,
   peeCellFound:!!lc,peeElementState:le?.state??null,peeBlockers:le?.blockers.map(b=>b.rule)??(lc?['no_matching_element']:['cell_not_in_ledger']),peeEarliest:le?.earliestStage??null,
   peeLeadRule:lead?.assignment??null,peeLeadMethod:lead?.methodCue??null,peeLeadCondition:lead?.condition??null,conditionMissing:MEASURED(ae.kind)&&!!lead&&(ae.conditions??[]).length>0&&!lead.condition,
   _private:{surface:ae.surface,value:ae.value,unit:ae.unit,product:ae.product,peeSubject:lead?.subject??null,peeUnit:lead?.unit??null,cellText:lc?.text??null}});}
 const ia=impliedAxes(lt.phase245Mode);const roleNorm=r=>r==='measure'?'property':r;
 out.push({id:s.id,page:s.page,publisher:s.publisher,category:s.category,stratum:s.stratum,phase245Mode:lt.phase245Mode,ledgerContext:lt.context,annotatorStructure:a.structure,annotatorEvidence:a.evidenceType,
  axes:{annotator:{row:a.rowAxis?.role,col:a.colAxis?.role},implied:ia,rowAgrees:roleNorm(a.rowAxis?.role)===ia.row,colAgrees:roleNorm(a.colAxis?.role)===ia.col},
  contextAgrees:(a.evidenceType==='publisher_measured')===(lt.context==='test'),cellsAnnotated:(a.cells??[]).length,cellsInLedger:lt.cells.length,
  elements:count(elements.filter(e=>e.id===s.id).map(e=>e.cls)),notes:lt.notes});
 elements.filter(e=>e.id===s.id).forEach(e=>out[out.length-1].elementRows=[...(out[out.length-1].elementRows??[]),e]);}
store.close();
const all=out.flatMap(t=>t.elementRows??[]);const meas=all.filter(e=>e.kind==='measured');
const summary={tables:out.length,publishers:[...new Set(out.map(t=>t.publisher))].length,elements:all.length,measuredElements:meas.length,
 byClass:count(all.map(e=>e.cls)),measuredByClass:count(meas.map(e=>e.cls)),
 notReadBlockers:count(meas.filter(e=>e.cls==='not_read').flatMap(e=>e.peeBlockers)),notReadEarliest:count(meas.filter(e=>e.cls==='not_read').map(e=>e.peeEarliest??'none')),
 notReadSoleBlocker:count(meas.filter(e=>e.cls==='not_read'&&e.peeBlockers.length===1).map(e=>e.peeBlockers[0])),
 conditionMissingOnRead:all.filter(e=>e.conditionMissing).length,measuredWithConditions:meas.filter(e=>e.conditions.length).length,
 falseMeasurements:all.filter(e=>e.cls.startsWith('read_as_measurement')).length,
 axisAgreement:{row:out.filter(t=>t.axes.rowAgrees).length,col:out.filter(t=>t.axes.colAgrees).length,of:out.length},contextAgreement:out.filter(t=>t.contextAgrees).length,
 cellsAnnotated:out.reduce((a,t)=>a+t.cellsAnnotated,0),cellsInLedger:out.reduce((a,t)=>a+t.cellsInLedger,0)};
const meta={schema:'pee.tables1e.compare.v1',label,policy:POLICY,lessons:LESSONS??(POLICY==='candidate_1e_tables'?'promoted+provisional (shadow)':null),at:new Date().toISOString(),build:buildIdentity(D),annotationsSha256:AF.annotationsSha256,tier:'development (spent pages); annotator is a separate Claude agent, not independent human ground truth'};
mkdirSync(join(REPO,'private-eval/tables-1e'),{recursive:true});
writeFileSync(PRIV,JSON.stringify({...meta,summary,tables:out},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...meta,summary,tables:out.map(t=>({...t,notes:undefined,elementRows:(t.elementRows??[]).map(({_private,...e})=>e)}))},null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
for(const t of out)console.log(t.id,t.publisher.padEnd(20),t.phase245Mode.padEnd(20),t.ledgerContext.padEnd(13),String(t.annotatorStructure).padEnd(28),String(t.annotatorEvidence).padEnd(22),'axes',t.axes.rowAgrees?'R':'r',t.axes.colAgrees?'C':'c',JSON.stringify(t.elements));
