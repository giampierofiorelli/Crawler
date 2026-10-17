#!/usr/bin/env node
/** Continuous-learning Step 1D-A2: census of the gold values no lead reads (development pages; no network).
 * For arm A (Step 1D-A) and arm C (with the semantic-document contract), every missing gold value gets:
 *  - where it is: absent from the HTML, only in scripts/attributes, visible but outside the reader's blocks, in a table cell,
 *    or in a prose block (with or without its unit next to the number);
 *  - region: whether the full Phase245 region model would exclude its block (boilerplate tag/role vs class-word marker);
 *  - the first reader gate that rejects it (prose: the Phase272 guided-reader gates in order; table cells: unit only in a
 *    label, unit not in the plan, not a test table);
 *  - optionally (--uncapped DIST: a copy of this build with the probe's 20/40-record and 8-per-block caps lifted) whether the
 *    record caps alone hide it.
 * Usage: node scripts/step1d-a2-missing-census.mjs LABEL [--uncapped DIST]. Private -> pee-knowledge/private-eval/experience/
 * step1d-a2-missing-LABEL.json; value-free counts and ids -> evaluation/experience/step1d-a2-missing-LABEL.json. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {documentLeads,documentInventory,buildIdentity} from './experience-observe.mjs';
const A=process.argv.slice(2);const label=A[0];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL [--uncapped DIST]');
const ui=A.indexOf('--uncapped');const UNCAPPED=ui>0?resolve(A[ui+1]):null;
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const OUT=process.env.STEP1D_A2_OUT_DIR;
const PRIV=OUT?join(OUT,`missing-private-${label}.json`):join(REPO,`private-eval/experience/step1d-a2-missing-${label}.json`);
const PUB=OUT?join(OUT,`missing-public-${label}.json`):`evaluation/experience/step1d-a2-missing-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const D=resolve('dist/src');const S=await import(D+'/experience_attribution_scoring.js');const PL=await import(D+'/phase272_extraction_plan.js');
const ST=await import(D+'/phase246_knowledge_store.js');const R=await import(D+'/phase248_category_registry.js');
const UE={db:['db','dba','db(a)','decibels','decibel'],nits:['nits','nit','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs','sec'],hours:['hours','hrs','h','hour'],'%':['%','percent'],l:['l','litres','liters'],w:['w','watts'],kwh:['kwh'],ms:['ms'],cfm:['cfm']};
const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return PL.canonicalUnit272?.(l)??l;};
const E=join(homedir(),'.local/share/product-evidence-engine/private-eval');const CAT={tv:'televisions',ap:'air_purifiers',af:'air_fryers',dw:'dishwashers'};
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const s1c=JSON.parse(readFileSync(join(E,'step1c/gold.json'),'utf8'));
const SETS=[{set:'step1c (spent; examined)',ev:'step1c',docs:s1c.documents.map(d=>({tag:d.tag,category:d.category})),gold:s1c.values},
 {set:'phase272 untouched (spent; examined)',ev:'phase272',gold:JSON.parse(readFileSync(join(E,'phase272/gold-untouched.json'),'utf8')).quantitative.map(q=>({...q,subjectStatus:'exact'}))},
 {set:'phase272 development pages',ev:'phase272',gold:JSON.parse(readFileSync(join(E,'phase272/gold-dev.json'),'utf8')).quantitative.map(q=>({...q,subjectStatus:'exact'}))}];
for(const st of SETS)st.docs??=[...new Set(st.gold.map(g=>g.doc))].map(tag=>({tag,category:CAT[tag.split('_')[1]]}));
// The Phase272 guided-reader gates, in the reader's order (src/phase225_transient_test_probe.ts, guided pass).
const HYP=/\b(?:would|if you|could|might|per year|a year|annual(?:ly)?|each year|over (?:a|the) year)\b/i;
const REP=/\b(?:measured|recorded|reached|peaked|clocked|took|needed|registered|used|consumed|pulls?|draws?|generates?|hit|ran at|came in at|our tests?|(?:we|i) found)\b/i;
const NEG=/\b(?:did not test|was not tested|have not tested|not measured|no measurements|not yet tested|planned to test|we will test|didn't test)\b/i;
const SEC=/\b(?:manufacturer (?:claims|states|reports|says)|advertised|marketing (?:material|claims)|press release|according to the manufacturer|specification sheet|quoted by|other reviewers measured|competitor|rather than the tested)\b/i;
const UNITX={db:'d[bB]|decibels?',nits:'nits?|cd/m',minutes:'min|minutes?|mins',seconds:'s|sec|secs|seconds?',hours:'h|hrs?|hours?','%':'%|percent',l:'l|litres?|liters?',w:'w|watts?',kwh:'kwh',ms:'ms',cfm:'cfm'};
const numRe=v=>new RegExp('(?<![\\d.,])(?:'+[String(v),...(Math.abs(v)>=1000?[Number(v).toLocaleString('en-US')]:[])].map(x=>x.replace(/\./g,'\\.')).join('|')+')(?![\\d])');
const store=new ST.KnowledgeStore246(LIVE);const rows=[];
for(const st of SETS)for(const d of st.docs){const g=st.gold.filter(x=>x.doc===d.tag).map(x=>({...x,unit:canon(x.unit)}));
 const cls={};for(const [k,p] of [['A','candidate_1c_inventory'],['C','candidate_1c_semantics_tables']]){const r=await documentLeads(D,{evaluation:st.ev,docTag:d.tag,category:d.category},{policy:p});
  cls[k]=Object.fromEntries(g.map(x=>[x.id,S.scoreItem1C(x,r.leads.map(l=>({...l,unit:canon(l.unit)})))]));}
 let unc=null;if(UNCAPPED){const r=await documentLeads(UNCAPPED,{evaluation:st.ev,docTag:d.tag,category:d.category},{policy:'candidate_1c_inventory'});unc=Object.fromEntries(g.map(x=>[x.id,S.scoreItem1C(x,r.leads.map(l=>({...l,unit:canon(l.unit)})))]));}
 const miss=g.filter(x=>cls.A[x.id]==='missing'||cls.C[x.id]==='missing');if(!miss.length)continue;
 const iv=await documentInventory(D,{evaluation:st.ev,docTag:d.tag,category:d.category},{semantics:true});const sem=iv.semantics,html=iv.html,blocks=iv.blocks;
 const plan=PL.compileExtractionPlan272(store,d.category,R.CATEGORY_REGISTRY250.find(e=>e.id===d.category)?.aliases??[],TAUGHT.filter(t=>t!==d.category));
 const docTest=blocks.some(b=>PL.TEST_CONTEXT272.test(b));
 const noScript=html.replace(/<!--([\s\S]*?)-->/g,'').replace(/<(script|style|svg|template|noscript|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const visible=noScript.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ');
 const anyUnit=new RegExp('(?<![\\d.,])(\\d{1,3}(?:,\\d{3})+(?:\\.\\d{1,3})?|\\d{1,7}(?:\\.\\d{1,3})?)\\s*('+PL.unitAlternation272(PL.EXPLORATORY_UNITS272)+')(?![a-z0-9])','gi');
 for(const v of miss){const re=numRe(v.value);const reU=new RegExp(re.source+'\\s*(?:'+(UNITX[v.unit]??v.unit.replace(/[^a-z0-9%]/gi,''))+')(?![a-z])','i');
  const bi=blocks.findIndex(b=>reU.test(b))>=0?blocks.findIndex(b=>reU.test(b)):blocks.findIndex(b=>re.test(b));const b=bi>=0?sem.blocks[bi]:null;
  const where=bi<0?(re.test(visible)?'visible_not_in_reader_blocks':re.test(html)?'scripts_or_attributes_only':'absent_from_html'):b?.cell?'table_cell':reU.test(blocks[bi])?'prose_value_with_unit':'prose_value_unit_elsewhere';
  const region=!b?null:b.region==='excluded'?(b.hardExcluded?'phase245_excluded_boilerplate':'phase245_excluded_class_marker_or_outside_main'):b.region;
  let gate=null;const lexUnit=PL.canonicalUnit272(v.unit)??(PL.EXPLORATORY_UNITS272.includes(v.unit)?v.unit:null);
  if(!lexUnit&&!PL.EXPLORATORY_UNITS272.includes(v.unit))gate='unit_not_in_generic_lexicon:'+v.unit;
  else if(!plan.units.includes(lexUnit??v.unit))gate='unit_not_in_category_plan:'+(lexUnit??v.unit);
  else if(where==='prose_value_with_unit'){const line=blocks[bi];
   for(const sent of line.split(/(?<=[.!?])\s+(?=[A-Z£])/)){for(const m of sent.matchAll(anyUnit)){if(Number(m[1].replace(/,/g,''))!==v.value)continue;const unit=PL.canonicalUnit272(m[2]);if(!unit)continue;
     const dim=PL.dimensionOfUnit272(unit);const prev=bi>0&&blocks[bi-1].length<120?blocks[bi-1]:'';const ctx=PL.planWords272(sent+' '+prev);
     const taught=new Set(plan.measurements.filter(q=>q.dimensions.includes(dim)).flatMap(q=>q.terms));
     gate=line.length>900?'block_over_900_chars':!docTest?'no_document_test_context':NEG.test(line)||SEC.test(line)?'negated_or_secondary_cue':
      !(ctx.some(w=>taught.has(w))||(ctx.some(w=>(PL.DIMENSION_WORDS272[dim]??[]).includes(w))&&REP.test(sent)))?'no_taught_term_or_report_cue':PL.DECLARATION_CUE272.test(sent)?'declaration_cue':
      PL.rangeOrBound272(sent,m.index,m.index+m[0].length)?'range_or_bound':HYP.test(sent)?'hypothetical_cue':'later_reader_rule_or_cap';break;}if(gate)break;}
   gate??='value_not_matched_by_reader_unit_pattern';}
  else if(where==='table_cell'){const t=sem.tables[b.cell.table];gate=t.hardExcluded?'table_in_boilerplate':t.context==='specification'?'specification_table':t.context!=='test'?'table_context_not_test':'table_label_without_unit_or_term';}
  else gate=where;
  rows.push({set:st.set,doc:d.tag,id:v.id,unit:v.unit,A:cls.A[v.id],C:cls.C[v.id],uncappedA:unc?.[v.id]??null,where,region,gate});}}
store.close();
const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});
const summary=Object.fromEntries(SETS.map(st=>{const r=rows.filter(x=>x.set===st.set);const mA=r.filter(x=>x.A==='missing'),mC=r.filter(x=>x.C==='missing');
 return [st.set,{gold:st.gold.length,missingA:mA.length,missingC:mC.length,readByC:mA.filter(x=>x.C!=='missing').length,
  whereA:count(mA.map(x=>x.where)),regionA:count(mA.map(x=>x.region??'no_block')),gateA:count(mA.map(x=>x.gate)),whereC:count(mC.map(x=>x.where)),gateC:count(mC.map(x=>x.gate)),
  ...(UNCAPPED?{foundWhenCapsLiftedA:mA.filter(x=>x.uncappedA&&x.uncappedA!=='missing').length}:{})}];}));
const out={schema:'pee.step1d-a2.missing-census.v1',label,at:new Date().toISOString(),tier:'development (spent and examined pages)',build:buildIdentity(D),uncappedBuild:UNCAPPED,summary};
writeFileSync(PRIV,JSON.stringify({...out,rows},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...out,rows:rows.map(({set,doc,id,unit,A,C,uncappedA,where,region,gate})=>({set,doc,id,unit,A,C,uncappedA,where,region,gate}))},null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
