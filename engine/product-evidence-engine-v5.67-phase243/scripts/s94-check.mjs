#!/usr/bin/env node
/** S94 independent check (Stage 4): the frozen Stage 1 arms (evaluation/s94/freeze-stage1.json) and the learning-reuse
 * arms on the S94 wave (never-examined pages; SSDs and monitors, both never taught), against the blind reference sealed in
 * evaluation/s94/annotation-freeze.json. Same scoring as scripts/s94-stage1.mjs.
 *   node scripts/s94-check.mjs LABEL [--out]     Public output: counts only; private rows in private-eval/s94/check-LABEL.json */
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
const LABEL=process.argv[2];if(!LABEL)throw Error('usage: LABEL');const WV=join(P,'s94/wave');
const material=[];
{const DRY=!!process.env.S94_DRY;let ref;if(DRY){ref=new Proxy({},{get:()=>({nature:'measured',property:'none',provenance:'publisher',subject:'unclear',evidenceLine:null,assumptionLines:[],concept:'x'})});}else{const fz=JSON.parse(readFileSync(new URL('../evaluation/s94/annotation-freeze.json',import.meta.url),'utf8'));const rb=readFileSync(join(WV,'annotation/annotations.json'));if(sha(rb)!==fz.annotationsSha256)throw Error('reference does not match its seal');
 ref=JSON.parse(rb).items;}for(const x of JSON.parse(readFileSync(join(WV,'check-items.json'),'utf8'))){const r=ref[x.id];if(!r)throw Error('unannotated '+x.id);
  material.push({set:'s94_'+x.category,S:'s94/wave',tag:x.page,line:x.bi,x,ref:r,id:x.id,technical:!!r.nature&&!/not a technical quantity/i.test(r.concept??'')});}}
const ARMS={C1:null,R1:{},T1:{tr:'all'},T1c:{tr:'all',comparatives:true},'T1-noarith':{tr:'stat'},'T1-nostat':{tr:'arith'},'T1-nomember':{tr:'all',members:false}};
const rows=[];
for(const m of material){const pg=pageOf(m.S,m.tag);const x=m.x;
 const locate=()=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((p,q)=>Math.abs(p-80)-Math.abs(q-80))[0]:null;};
 const base={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt??locate(),surface:x.surface,pageSubject:x.pageSubject??null,frame:pg.title};
 const start=x.start??(pg.blocks[m.line]?.indexOf(x.surface)>=0?pg.blocks[m.line].indexOf(x.surface):0);
 const row={id:m.id,set:m.set,line:m.line,ref:m.ref,technical:m.technical,arms:{},obs:{...base,structure:null,_m:m}};
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
const score=(rs0,arm)=>{const rs=rs0.filter(r=>r.technical);const o={items:rs.length,correct:rs.filter(r=>r.arms[arm].nature===r.ref.nature).length,abstained:rs.filter(r=>r.arms[arm].nature==='unresolved').length,
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
// learning reuse (Stage 2 question on later unseen pages): definitions learned from earlier spent material (S88-S93) with
// the S94 relation typing; attribution of the check values with and without them
const L=await import(D+'definition_learning.js');const LEARN={typeGate:true,distributional:{minSimilarity:0.3,margin:0.05,window:5,minCount:3},relations:true,strongSeeds:true};
function learningObs(){const srcs=[['s88','heldout_eval','s88/e4-items.json'],['s89','regression','s89/learn-items.json'],['s89','heldout_eval','s89/check-items.json'],['s90','heldout_eval','s90/check-items.json'],['s91','heldout_eval','s91/check-items.json'],['s92','heldout_eval','s92/check-items.json'],['s93','heldout_eval','s93/check-items.json']];
 const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};const out=[];
 for(const [S,role,f] of srcs){const R=join(P,S);const wave=JSON.parse(readFileSync(join(R,'wave.json'),'utf8'));const pos=new Map();
  for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const html=readFileSync(join(R,'raw',p.tag+'.html'),'utf8');const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').trim();
   const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
   const seen=new Set();const u=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});const k=Math.ceil(u.length/40)||1;
   u.filter((_,i)=>i%k===0).forEach((a,j)=>pos.set(`${p.tag}-${j}`,{surface:a.surface,structure:a.bi<sem.blocks.length?I.structuralContextOf(defs,sem,blocks,a.bi,a.start):null,title}));}
  for(const x of JSON.parse(readFileSync(join(P,f),'utf8'))){const z=pos.get(x.id);if(!z||z.surface!==x.surface)continue;
   out.push({docId:x.page+'@'+S,publisher:x.host.replace(/^www\./,''),category:x.category,value:x.value,unit:x.unit,label:x.label,context:x.context,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??x.title??null,structure:z.structure,frame:z.title});}}
 return out;}
const layer=L.learnFromDocuments(defs,qk,learningObs(),L.DEFAULT_THRESHOLDS,LEARN);const props=L.proposeDefinitions(defs,layer);const learned=L.withLearnedDefinitions(qk,defs.pack,props);
const promoted=props.filter(p=>!p.verification.failed.length);
const attr={};for(const k of ['base','object','learned']){const s0={refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0,toLearned:0,learnedMatchesReferenceConcept:0};
 for(const r of rows){const a=r.ref;const o=r.obs;const pg=pageOf(o._m.S,o._m.tag);const x=o._m.x;
  const st=o._m.line<pg.sem.blocks.length?I.structuralContextOf(defs,pg.sem,pg.blocks,o._m.line,x.start??0):null;const inp={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:o.valueAt,surface:x.surface,pageSubject:x.pageSubject??null,frame:pg.title,structure:st};
  const v=k==='base'?I.attributeProperty(defs,qk,inp).value:k==='object'?I.attributeProperty(defs,qk,inp,{objectResolution:true}).value:I.attributeProperty(learned,qk,inp,{objectResolution:true}).value;
  const isL=!!v&&v.startsWith('learned_');if(isL)s0.toLearned++;
  if(a.property==='none'){s0.refNone++;if(isL){const p=promoted.find(z=>z.id===v);const nmc=String(a.concept??'').toLowerCase();if(p&&nmc&&p.objectNouns.concat(p.terms).some(n=>nmc.includes(n)))s0.learnedMatchesReferenceConcept++;else s0.falseAttribution++;}else if(v&&v!==a.alsoAcceptable)s0.falseAttribution++;}
  else{s0.refPositive++;if(!v)s0.abstained++;else if(v===a.property||v===a.alsoAcceptable)s0.correct++;else s0.wrong++;}}
 attr[k]=s0;}
for(const r of rows)delete r.obs;
const sets=['all',...new Set(rows.map(r=>r.set))];
const out={schema:'pee.s94.check.v1',label:LABEL,note:'S94 independent check, first run of the frozen arms on never-examined pages (SSDs, monitors: never taught)',attribution:attr,learned:promoted.map(p=>({id:p.id,label:p.label,kind:p.kind,relations:p.relations.filter(r=>r.relation!=='same_kind').map(r=>r.relation+':'+r.property)})),
 preregistration:sha(readFileSync(new URL('../evaluation/s94/preregistration-stage1.json',import.meta.url))),
 results:Object.fromEntries(sets.map(s=>{const rs=s==='all'?rows:rows.filter(r=>r.set===s);return [s,Object.fromEntries(Object.keys(ARMS).map(a=>[a,score(rs,a)]))];}))};
{const f=new URL(`../evaluation/s94/check-${LABEL}.json`,import.meta.url).pathname;if(process.argv.includes('--out')&&!process.env.S94_DRY){if(existsSync(f))throw Error('exists '+f);writeFileSync(f,JSON.stringify(out,null,1)+'\n');}const d=join(P,'s94',`check-${LABEL}.json`);if(process.env.S94_DRY){console.log('dry run: nothing written');process.exit(0);}if(existsSync(d))throw Error('exists '+d);writeFileSync(d,JSON.stringify(rows,null,1));}
console.log('ATTR',JSON.stringify(attr),'promoted',promoted.length);
for(const [s,v] of Object.entries(out.results))for(const [a,o] of Object.entries(v))console.log(s.padEnd(18),a.padEnd(11),'nat',o.correct+'/'+o.items,'abst',o.abstained,'prov',o.provenanceCorrect,'calc',`${o.perClass.calculated.correct}/${o.perClass.calculated.predicted}/${o.perClass.calculated.reference}`,'falseCalc',o.falseCalculated,
 'meas',`${o.perClass.measured.correct}/${o.perClass.measured.predicted}/${o.perClass.measured.reference}`,'decl',`${o.perClass.declared.correct}/${o.perClass.declared.predicted}/${o.perClass.declared.reference}`,'links',`${o.links.reachesElsewhere}/${o.links.elsewhere} m${o.links.meanLines}`,'inputs',`${o.inputs.foundAtLeastOne}/${o.inputs.calculatedWithReferenceInputs}`,'subj',`${o.subject.correct}/${o.subject.decided}/${o.subject.withReference} rAsO${o.subject.reviewedAsOther} oAsR${o.subject.otherAsReviewed}`);
