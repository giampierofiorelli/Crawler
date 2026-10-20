#!/usr/bin/env node
/** S94 Stage 1 development (evaluation/s94/preregistration-stage1.json): joint table and document inference on SPENT material
 * (the S93 check, whose first run is committed unchanged, and the S93 development reference on S89/S91). Arms: C1 (S92
 * rules), R1 (S93), T1 (+ table relations), T1c (+ comparative prose), ablations T1-noarith, T1-nostat.
 *   node scripts/s94-stage1.mjs [--out PUBLIC] [--detail PRIVATE]     Public output: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const G=await import(D+'table_interpreter1g.js');const GL=await import(D+'table_interpreter1g_lessons.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);const EXTRA=['GL11_calculation_inputs_keep_method','GL12_parallel_tables_inherit_links'];
const instr=Object.values(defs.dimensions.get('instrument')?.values??{}).flat();const nm=x=>String(x??'').replace(/\s+/g,' ').trim().toLowerCase();
const ROLE={measured_result:'measured',declared_spec:'declared',certified_or_quoted:'declared',test_condition:'condition',programme_preset:'condition',derived:'measured'};
const PROV={measured_result:'publisher',declared_spec:'manufacturer',certified_or_quoted:'third_party',test_condition:'publisher',programme_preset:'publisher',derived:'publisher'};
const pages=new Map();const pageOf=(S,tag)=>{const k=S+'-'+tag;if(pages.has(k))return pages.get(k);const R=join(P,S);const wave=JSON.parse(readFileSync(join(R,'wave.json'),'utf8'));const p=wave.pages.find(x=>x.tag===tag);
 const b=readFileSync(join(R,'raw',tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+tag);const html=b.toString('utf8');
 const v={blocks:textBlocks225(html,{maxBlocks:3000}).blocks,sem:SEM.readDocumentSemantics1D2(html,p.url),model:G.documentModel1G(html),
  obs:G.interpretDocumentTables1G(html,{lessons:[...GL.activeInterpreterLessons1G(),...EXTRA]}).tables.flatMap(t=>t.observations),tr:G.tableRelations1G(html),title:(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').trim()};pages.set(k,v);return v;};
const lineOf=(pg,text)=>{const t=nm(text).slice(0,60);if(!t)return null;const i=pg.blocks.findIndex(b=>nm(b).includes(t)||t.includes(nm(b).slice(0,60))&&nm(b).length>20);return i>=0?i:null;};
// material: the S93 development reference (S89/S91) and the S93 check, both spent
const material=[];
{const fz=JSON.parse(readFileSync(new URL('../evaluation/s93/nature-dev-freeze.json',import.meta.url),'utf8'));const A=join(P,'s93/nature-dev');if(sha(readFileSync(join(A,'annotations.json')))!==fz.annotationsSha256)throw Error('nature-dev seal');
 const ref=JSON.parse(readFileSync(join(A,'annotations.json'),'utf8')).items;const full=new Map();
 for(const it of JSON.parse(readFileSync(join(A,'items.json'),'utf8')).items){const [S,id]=it.id.split(':');if(!full.has(S))full.set(S,new Map(JSON.parse(readFileSync(join(P,S,'check-items.json'),'utf8')).map(x=>[x.id,x])));
  material.push({set:'dev_'+S,S,tag:it.page.slice(S.length+1),line:it.line,x:full.get(S).get(id),ref:ref[it.id],id:it.id});}}
{const fz=JSON.parse(readFileSync(new URL('../evaluation/s93/annotation-freeze.json',import.meta.url),'utf8'));const rb=readFileSync(join(P,'s93/annotation/annotations.json'));if(sha(rb)!==fz.annotationsSha256)throw Error('s93 seal');
 const ref=JSON.parse(rb).items;for(const x of JSON.parse(readFileSync(join(P,'s93/check-items.json'),'utf8'))){const r=ref[x.id];if(!r||!r.nature||/not a technical quantity/i.test(r.concept??''))continue;
  material.push({set:'s93_'+x.category,S:'s93',tag:x.page,line:x.bi,x,ref:r,id:'s93:'+x.id});}}
const ARMS={C1:null,R1:{},T1:{tr:'all'},T1c:{tr:'all',comparatives:true},'T1-noarith':{tr:'stat'},'T1-nostat':{tr:'arith'},'T1-nomember':{tr:'all',members:false}};
const rows=[];
for(const m of material){const pg=pageOf(m.S,m.tag);const x=m.x;
 const locate=()=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((p,q)=>Math.abs(p-80)-Math.abs(q-80))[0]:null;};
 const base={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt??locate(),surface:x.surface,pageSubject:x.pageSubject??null,frame:pg.title};
 const start=x.start??(pg.blocks[m.line]?.indexOf(x.surface)>=0?pg.blocks[m.line].indexOf(x.surface):0);
 const row={id:m.id,set:m.set,line:m.line,ref:m.ref,arms:{}};
 for(const [arm,cfg] of Object.entries(ARMS)){
  const tr=cfg?.tr?{...pg.tr,derivations:pg.tr.derivations.filter(d=>cfg.tr==='all'||(cfg.tr==='stat')===(d.kind==='statistic_over_set')),members:cfg.members===false||cfg.tr==='stat'?[]:pg.tr.members}:undefined;
  const rel={model:pg.model,tableObservations:pg.obs,...(tr?{tableRelations:tr}:{})};
  const sel=arm==='C1'?'first':'argument';
  // the reader block text the value sits in: for a table cell the cell text (the item label is a window of it)
  const st=m.line<pg.sem.blocks.length?I.documentContextOf(defs,pg.sem,pg.blocks,m.line,start,{rel,surface:x.surface,value:x.value,use:{tables:true,prose:true,selection:sel,subject:pg.title,instrumentTerms:instr}}):null;
  const r=arm==='C1'?I.interpretWithDefinitions(defs,qk,{...base,structure:st},{roleModel:'links',situation:true})
   :I.interpretWithDefinitions(defs,qk,{...base,block:pg.blocks[m.line]??null,structure:st},{roleModel:'links',situation:true,provenance:true,relations:rel,comparatives:!!cfg.comparatives});
  if(arm==='C1'){const v=r.role.value&&r.role.value!=='unresolved'?ROLE[r.role.value]:'unresolved';const local=!/co_occurrence|bridge|table_|parallel/.test(r.role.reason??'');
   const ls=st?.links??[];const top=ls.length?Math.min(...ls.map(l=>l.rank)):0;
   row.arms.C1={nature:v,provenance:r.role.value&&r.role.value!=='unresolved'?PROV[r.role.value]:'unresolved',lines:local?[m.line]:[...new Set(ls.filter(l=>l.rank===top).flatMap(l=>(l.statements??[]).map(s=>s.block<0?m.line:lineOf(pg,pg.model.blocks[s.block]?.text??''))).filter(v=>v!==null))],inputs:[],subject:null};continue;}
  const ev=r.evidence;const lines=(ev?.statements??[]).map(s=>s.line!=null?s.line:s.text?lineOf(pg,s.text):s.block<0?m.line:lineOf(pg,pg.model.blocks[s.block]?.text??'')).filter(v=>v!==null);
  const inputs=(ev?.calculation?.assumptions??[]).map(a=>a.text);
  row.arms[arm]={nature:ev?.nature??'unresolved',provenance:ev?.provenance??'unresolved',lines:[...new Set(lines)],inputs,subject:ev?.subject?.value??null,
   inputLinesFound:(m.ref.assumptionLines??[]).filter(L=>inputs.some(t=>nm(pg.blocks[L]??'').includes(nm(t))||nm(t).includes(nm(pg.blocks[L]??''))&&nm(pg.blocks[L]??'').length>=4)).length};}
 rows.push(row);}
const CL=['measured','calculated','declared','condition'];
const score=(rs,arm)=>{const o={items:rs.length,correct:rs.filter(r=>r.arms[arm].nature===r.ref.nature).length,abstained:rs.filter(r=>r.arms[arm].nature==='unresolved').length,
  provenanceCorrect:rs.filter(r=>r.arms[arm].provenance===r.ref.provenance).length,perClass:{}};
 for(const c of CL){const g=rs.filter(r=>r.ref.nature===c),p=rs.filter(r=>r.arms[arm].nature===c),ok=p.filter(r=>r.ref.nature===c).length;o.perClass[c]={reference:g.length,predicted:p.length,correct:ok,precision:p.length?+(ok/p.length).toFixed(3):null,recall:g.length?+(ok/g.length).toFixed(3):null};}
 o.falseCalculated=rs.filter(r=>r.arms[arm].nature==='calculated'&&(r.ref.nature==='measured'||r.ref.nature==='declared')).length;
 const el=rs.filter(r=>r.ref.evidenceLine!=null&&r.arms[arm].nature===r.ref.nature&&r.arms[arm].nature!=='unresolved');
 o.links={correctWithReferenceLine:el.length,reachesLine:el.filter(r=>r.arms[arm].lines.includes(r.ref.evidenceLine)).length,elsewhere:el.filter(r=>r.ref.evidenceLine!==r.line).length,
  reachesElsewhere:el.filter(r=>r.ref.evidenceLine!==r.line&&r.arms[arm].lines.includes(r.ref.evidenceLine)).length,meanLines:el.length?+(el.reduce((n,r)=>n+r.arms[arm].lines.length,0)/el.length).toFixed(2):null};
 const calc=rs.filter(r=>r.ref.nature==='calculated'&&r.ref.assumptionLines?.length);
 o.inputs={calculatedWithReferenceInputs:calc.length,foundAtLeastOne:calc.filter(r=>(r.arms[arm].inputLinesFound??0)>0).length};
 const sj=rs.filter(r=>r.ref.subject==='reviewed_product'||r.ref.subject==='other_product');const pred=r=>r.arms[arm].subject==='set'?'other_product':r.arms[arm].subject;
 o.subject={withReference:sj.length,decided:sj.filter(r=>pred(r)==='reviewed_product'||pred(r)==='other_product').length,correct:sj.filter(r=>pred(r)===r.ref.subject).length,
  reviewedAsOther:sj.filter(r=>r.ref.subject==='reviewed_product'&&pred(r)==='other_product').length,otherAsReviewed:sj.filter(r=>r.ref.subject==='other_product'&&pred(r)==='reviewed_product').length};
 return o;};
const sets=['all',...new Set(rows.map(r=>r.set))];
const out={schema:'pee.s94.stage1-dev.v1',note:'development on SPENT material (S93 check after its unchanged first run; S93 development reference). TUNED by definition; never held-out',
 preregistration:sha(readFileSync(new URL('../evaluation/s94/preregistration-stage1.json',import.meta.url))),
 results:Object.fromEntries(sets.map(s=>{const rs=s==='all'?rows:rows.filter(r=>r.set===s);return [s,Object.fromEntries(Object.keys(ARMS).map(a=>[a,score(rs,a)]))];}))};
if(arg('out')){if(existsSync(arg('out')))throw Error('exists');writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}if(arg('detail'))writeFileSync(arg('detail'),JSON.stringify(rows,null,1));
for(const [s,v] of Object.entries(out.results))for(const [a,o] of Object.entries(v))console.log(s.padEnd(18),a.padEnd(11),'nat',o.correct+'/'+o.items,'abst',o.abstained,'prov',o.provenanceCorrect,'calc',`${o.perClass.calculated.correct}/${o.perClass.calculated.predicted}/${o.perClass.calculated.reference}`,'falseCalc',o.falseCalculated,
 'meas',`${o.perClass.measured.correct}/${o.perClass.measured.predicted}/${o.perClass.measured.reference}`,'decl',`${o.perClass.declared.correct}/${o.perClass.declared.predicted}/${o.perClass.declared.reference}`,'links',`${o.links.reachesElsewhere}/${o.links.elsewhere} m${o.links.meanLines}`,'inputs',`${o.inputs.foundAtLeastOne}/${o.inputs.calculatedWithReferenceInputs}`,'subj',`${o.subject.correct}/${o.subject.decided}/${o.subject.withReference} rAsO${o.subject.reviewedAsOther} oAsR${o.subject.otherAsReviewed}`);
