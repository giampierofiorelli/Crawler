#!/usr/bin/env node
/** S93 independent check (evaluation/s93/preregistration.json; arms frozen in evaluation/s93/freeze.json).
 *   run LABEL     every arm on the check items (private rows), once per LABEL
 *   score LABEL   against the sealed reference (evaluation/s93/annotation-freeze.json); public counts
 * Items and annotator input were built with scripts/s92-check.mjs (items, input) on private-eval/s93.  Public: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');const P=join(homedir(),'.local/share/product-evidence-engine/private-eval');const ROOT=process.env.S93_ROOT??join(P,'s93');
const pub=f=>process.env.S93_PUB?join(process.env.S93_PUB,f):new URL('../evaluation/s93/'+f,import.meta.url).pathname;
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const L=await import(D+'definition_learning.js');const EC=await import(D+'evidence_combination.js');const G=await import(D+'table_interpreter1g.js');const GL=await import(D+'table_interpreter1g_lessons.js');
const DE=await import(D+'document_evidence.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);const [cmd,LABEL]=process.argv.slice(2);
const noOverwrite=f=>{if(existsSync(f))throw Error(f+' exists: never overwritten');return f;};const nm=x=>String(x??'').replace(/\s+/g,' ').trim().toLowerCase();
const EXTRA=['GL11_calculation_inputs_keep_method','GL12_parallel_tables_inherit_links'];const instr=Object.values(defs.dimensions.get('instrument')?.values??{}).flat();
const ROLE={measured_result:'measured',declared_spec:'declared',certified_or_quoted:'declared',test_condition:'condition',programme_preset:'condition',derived:'measured'};
const PROV={measured_result:'publisher',declared_spec:'manufacturer',certified_or_quoted:'third_party',test_condition:'publisher',programme_preset:'publisher',derived:'publisher'};
const vote=r=>r==='measured'||r==='derived'?1:r==='declared'?-1:0;
const nearest=(links,rel)=>{const ls=links.filter(l=>rel.includes(l.relation)).sort((a,b)=>a.rank-b.rank);if(!ls.length)return 0;const top=ls.filter(l=>l.rank===ls[0].rank);const v=new Set(top.map(l=>vote(l.role)));return v.size===1?[...v][0]:0;};
const N6=['A0_with_reason','A1_local_evidence','table_links','co_occurrence','bridge','situation'];
const sig6=r=>[r.A0reason==='no_other_role'?0:vote(r.arms.A0.role),vote(r.arms.A1.role),nearest(r.links,['table_link','table_structure','parallel_table']),nearest(r.links,['co_occurrence']),nearest(r.links,['bridge']),r.situation==='episodic'?1:r.situation==='attributive'?-1:0];
const LEARN={typeGate:true,distributional:{minSimilarity:0.3,margin:0.05,window:5,minCount:3},relations:true,strongSeeds:true};
function learningObs(){const srcs=[['s88','heldout_eval','s88/e4-items.json'],['s89','regression','s89/learn-items.json'],['s89','heldout_eval','s89/check-items.json'],['s90','heldout_eval','s90/check-items.json'],['s91','heldout_eval','s91/check-items.json'],['s92','heldout_eval','s92/check-items.json']];
 const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};const out=[];
 for(const [S,role,f] of srcs){const R=join(P,S);const wave=JSON.parse(readFileSync(join(R,'wave.json'),'utf8'));const pos=new Map();
  for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const html=readFileSync(join(R,'raw',p.tag+'.html'),'utf8');const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').trim();
   const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface});}});
   const seen=new Set();const u=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});const k=Math.ceil(u.length/40)||1;
   u.filter((_,i)=>i%k===0).forEach((a,j)=>pos.set(`${p.tag}-${j}`,{surface:a.surface,structure:a.bi<sem.blocks.length?I.structuralContextOf(defs,sem,blocks,a.bi,a.start):null,title}));}
  for(const x of JSON.parse(readFileSync(join(P,f),'utf8'))){const z=pos.get(x.id);if(!z||z.surface!==x.surface)throw Error('realign '+S+' '+x.id);
   out.push({docId:x.page+'@'+S,publisher:x.host.replace(/^www\./,''),category:x.category,value:x.value,unit:x.unit,label:x.label,context:x.context,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??x.title??null,structure:z.structure,frame:z.title});}}
 return out;}
if(cmd==='run'){const f=noOverwrite(join(ROOT,`run-${LABEL}.json`));const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));
 const pages=new Map();for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval')){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  pages.set(p.tag,{blocks:textBlocks225(html,{maxBlocks:3000}).blocks,sem:SEM.readDocumentSemantics1D2(html,p.url),model:G.documentModel1G(html),obs:G.interpretDocumentTables1G(html,{lessons:[...GL.activeInterpreterLessons1G(),...EXTRA]}).tables.flatMap(t=>t.observations),title:(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').trim()});}
 const lineOf=(pg,text)=>{const t=nm(text).slice(0,60);if(!t)return null;const i=pg.blocks.findIndex(b=>nm(b).includes(t)||t.includes(nm(b).slice(0,60))&&nm(b).length>20);return i>=0?i:null;};
 const rows=it.map(x=>{const pg=pages.get(x.page);const base={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt,surface:x.surface,pageSubject:x.pageSubject,frame:pg.title};const rel={model:pg.model,tableObservations:pg.obs};
  const st=sel=>x.bi<pg.sem.blocks.length?I.documentContextOf(defs,pg.sem,pg.blocks,x.bi,x.start,sel?{rel,surface:x.surface,value:x.value,use:{tables:true,prose:true,selection:sel,subject:pg.title,instrumentTerms:instr}}:undefined):null;
  const s0=st(null),sF=st('first'),sA=st('argument');
  const a0=I.interpretWithDefinitions(defs,qk,{...base,structure:s0},{roleModel:'s90'});const a1=I.interpretWithDefinitions(defs,qk,{...base,structure:s0},{roleModel:'evidence'});
  const c1=I.interpretWithDefinitions(defs,qk,{...base,structure:sF},{roleModel:'links',situation:true});const r1=I.interpretWithDefinitions(defs,qk,{...base,structure:sA},{roleModel:'links',situation:true,provenance:true,relations:rel});
  const R=o=>o.role.value&&o.role.value!=='unresolved'?ROLE[o.role.value]:'unresolved';const Pv=o=>o.role.value&&o.role.value!=='unresolved'?PROV[o.role.value]:'unresolved';
  const linkLines=links=>{if(!links.length)return [];const top=Math.min(...links.map(l=>l.rank));return [...new Set(links.filter(l=>l.rank===top).flatMap(l=>(l.statements??[]).map(s=>s.block<0?x.bi:lineOf(pg,pg.model.blocks[s.block]?.text??''))).filter(v=>v!==null))];};
  const c1local=!/co_occurrence|bridge|table_|parallel/.test(c1.role.reason??'');
  const r1lines=(r1.evidence?.statements??[]).map(s=>s.line!=null?s.line:s.block<0?x.bi:lineOf(pg,pg.model.blocks[s.block]?.text??'')).filter(v=>v!==null);
  let situation=null;{const va=x.valueAt;const ss=x.label.slice(0,va).search(/[^.!?]*$/);const sent=x.label.slice(ss);const cut=sent.slice(va-ss).search(/[.!?]\s/);situation=I.situationTypeOf(cut>0?sent.slice(0,va-ss+cut+1):sent,va-ss,va-ss+String(x.surface).length);}
  return {id:x.id,line:x.bi,category:x.category,A0reason:a0.role.reason,situation,links:sA?.links??[],
   arms:{A0:{role:R(a0)},A1:{role:R(a1)},C1:{role:R(c1),nature:R(c1),provenance:Pv(c1),lines:c1local?[x.bi]:linkLines(sF?.links??[])},R1:{role:R(r1),nature:r1.evidence?.nature??'unresolved',provenance:r1.evidence?.provenance??'unresolved',lines:r1lines,assumptions:(r1.evidence?.calculation?.assumptions??[]).map(a=>a.text)}},
   obs:{...base,structure:s0}};});
 const lm=EC.fitLabelModel(N6,rows.map(sig6),{margin:0.5});
 for(const r of rows){const d=EC.predictLabel(lm,sig6(r));r.arms.D2={role:r.arms.C1.role==='condition'?'condition':d.label===1?'measured':d.label===-1?'declared':'unresolved'};}
 // attribution arms: base, object resolution, learned definitions (inductive; transductive with the check items, no reference)
 const lobs=learningObs();const checkObs=rows.map(r=>({...r.obs,docId:r.id.replace(/-\d+$/,'')+'@s93',publisher:it.find(x=>x.id===r.id).host.replace(/^www\./,'')}));
 const layers={};for(const mode of ['inductive','transductive']){const layer=L.learnFromDocuments(defs,qk,mode==='inductive'?lobs:[...lobs,...checkObs],L.DEFAULT_THRESHOLDS,LEARN);const props=L.proposeDefinitions(defs,layer);layers[mode]={proposals:props,defs:L.withLearnedDefinitions(qk,defs.pack,props)};}
 for(const r of rows){r.attribution={base:I.attributeProperty(defs,qk,r.obs).value,object:I.attributeProperty(defs,qk,r.obs,{objectResolution:true}).value,
  learned_inductive:I.attributeProperty(layers.inductive.defs,qk,r.obs,{objectResolution:true}).value,learned_transductive:I.attributeProperty(layers.transductive.defs,qk,r.obs,{objectResolution:true}).value};delete r.obs;}
 writeFileSync(f,JSON.stringify({label:LABEL,definitions:defs.identity,freeze:sha(readFileSync(pub('freeze.json'))),at:new Date().toISOString(),labelModel:lm,
  learned:Object.fromEntries(Object.entries(layers).map(([k,v])=>[k,v.proposals.map(p=>({id:p.id,label:p.label,kind:p.kind,terms:p.terms,objectNouns:p.objectNouns,relations:p.relations,verification:p.verification}))])),rows},null,1));
 console.log(LABEL,'rows',rows.length,'promoted',Object.fromEntries(Object.entries(layers).map(([k,v])=>[k,v.proposals.filter(p=>!p.verification.failed.length).length])));}
if(cmd==='score'){const frz=JSON.parse(readFileSync(pub('annotation-freeze.json'),'utf8'));const rb=readFileSync(join(ROOT,'annotation','annotations.json'));if(sha(rb)!==frz.annotationsSha256)throw Error('reference does not match its seal');
 const ref=JSON.parse(rb).items;const run=JSON.parse(readFileSync(join(ROOT,`run-${LABEL}.json`),'utf8'));const pgOf=new Map(JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8')).map(x=>[x.id,x]));
 const NAT=['measured','calculated','declared','condition'];
 const nat=(rs,arm)=>{const A=rs.filter(r=>ref[r.id]&&ref[r.id].property!=='none'&&ref[r.id].nature);const o={items:A.length,correct:A.filter(r=>r.arms[arm].nature===ref[r.id].nature).length,abstained:A.filter(r=>r.arms[arm].nature==='unresolved').length,
   provenanceCorrect:A.filter(r=>r.arms[arm].provenance===ref[r.id].provenance).length,perClass:{}};
  for(const c of NAT){const g=A.filter(r=>ref[r.id].nature===c),p=A.filter(r=>r.arms[arm].nature===c),ok=p.filter(r=>ref[r.id].nature===c).length;o.perClass[c]={reference:g.length,predicted:p.length,correct:ok,precision:p.length?+(ok/p.length).toFixed(3):null,recall:g.length?+(ok/g.length).toFixed(3):null,abstained:g.filter(r=>r.arms[arm].nature==='unresolved').length};}
  const el=A.filter(r=>ref[r.id].evidenceLine!=null&&r.arms[arm].nature===ref[r.id].nature);
  o.links={correctWithReferenceLine:el.length,reachesLine:el.filter(r=>r.arms[arm].lines.includes(ref[r.id].evidenceLine)).length,elsewhere:el.filter(r=>ref[r.id].evidenceLine!==r.line).length,reachesElsewhere:el.filter(r=>ref[r.id].evidenceLine!==r.line&&r.arms[arm].lines.includes(ref[r.id].evidenceLine)).length};
  if(arm==='R1'){const calc=A.filter(r=>ref[r.id].nature==='calculated'&&ref[r.id].assumptionLines?.length);const pages=new Map();
   o.assumptions={calculatedWithReferenceAssumptions:calc.length,recognisedCalculated:calc.filter(r=>r.arms.R1.nature==='calculated').length,
    foundAtLeastOne:calc.filter(r=>{const pg=pgOf.get(r.id).page;if(!pages.has(pg))pages.set(pg,readFileSync(join(ROOT,'annotation','pages',pg+'.txt'),'utf8').split('\n'));const lines=pages.get(pg);
     return r.arms.R1.assumptions.some(t=>ref[r.id].assumptionLines.some(L=>nm(lines[L]??'').includes(nm(t))));}).length};}
  return o;};
 const role=(rs,arm)=>{const A=rs.filter(r=>ref[r.id]&&ref[r.id].property!=='none'&&(ref[r.id].nature==='measured'||ref[r.id].nature==='declared'));const g=r=>ref[r.id].nature;const R=r=>r.arms[arm].role;
  const o={items:A.length,correct:A.filter(r=>R(r)===g(r)).length,abstained:A.filter(r=>R(r)==='unresolved').length,allMeasured:A.filter(r=>g(r)==='measured').length,allDeclared:A.filter(r=>g(r)==='declared').length};
  for(const c of ['measured','declared']){const p=A.filter(r=>R(r)===c),ok=p.filter(r=>g(r)===c).length,gg=A.filter(r=>g(r)===c);o[c]={reference:gg.length,predicted:p.length,correct:ok,precision:p.length?+(ok/p.length).toFixed(3):null,recall:gg.length?+(ok/gg.length).toFixed(3):null};}return o;};
 const attr=(rs,k)=>{const s={refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0,toLearned:0,learnedMatchesReferenceConcept:0};
  const promoted=[...run.learned.inductive,...run.learned.transductive];
  for(const r of rs){const a=ref[r.id];if(!a)continue;const v=r.attribution[k];const isL=!!v&&v.startsWith('learned_');if(isL)s.toLearned++;
   if(a.property==='none'){s.refNone++;if(isL){const p=promoted.find(x=>x.id===v);if(p&&a.concept&&p.objectNouns.concat(p.terms).some(n=>nm(a.concept).includes(n)))s.learnedMatchesReferenceConcept++;else s.falseAttribution++;}else if(v&&v!==a.alsoAcceptable)s.falseAttribution++;}
   else{s.refPositive++;if(!v)s.abstained++;else if(v===a.property||v===a.alsoAcceptable)s.correct++;else s.wrong++;}}return s;};
 const groups={all:run.rows,...Object.fromEntries([...new Set(run.rows.map(r=>r.category))].map(c=>[c,run.rows.filter(r=>r.category===c)]))};
 const out={schema:'pee.s93.check-score.v1',label:LABEL,reference:frz.annotationsSha256,freeze:run.freeze,
  referenceCounts:{items:Object.keys(ref).length,property:run.rows.filter(r=>ref[r.id]?.property!=='none').length,nature:['measured','calculated','declared','condition','other'].reduce((m,c)=>(m[c]=run.rows.filter(r=>ref[r.id]?.property!=='none'&&ref[r.id]?.nature===c).length,m),{})},
  nature:Object.fromEntries(Object.entries(groups).map(([g,rs])=>[g,{R0_C1:nat(rs,'C1'),R1:nat(rs,'R1')}])),
  role:Object.fromEntries(Object.entries(groups).map(([g,rs])=>[g,Object.fromEntries(['A0','A1','C1','D2','R1'].map(a=>[a,role(rs,a)]))])),
  attribution:Object.fromEntries(Object.entries(groups).map(([g,rs])=>[g,Object.fromEntries(['base','object','learned_inductive','learned_transductive'].map(k=>[k,attr(rs,k)]))])),
  learned:Object.fromEntries(Object.entries(run.learned).map(([k,v])=>[k,v.filter(p=>!p.verification.failed.length).map(p=>({id:p.id,terms:p.terms,relations:p.relations.map(r=>r.relation+':'+r.property)}))])),
  labelModel:{signals:run.labelModel.signals,accuracy:run.labelModel.accuracy,coverage:run.labelModel.coverage}};
 writeFileSync(noOverwrite(pub(`check-${LABEL}.json`)),JSON.stringify(out,null,1)+'\n');
 console.log('reference',JSON.stringify(out.referenceCounts));
 for(const [g,v] of Object.entries(out.nature))for(const [a,x] of Object.entries(v))console.log('NATURE',g,a,x.correct+'/'+x.items,'abst',x.abstained,'prov',x.provenanceCorrect,'links',JSON.stringify(x.links),x.assumptions?JSON.stringify(x.assumptions):'','|',Object.entries(x.perClass).map(([c,p])=>`${c} ${p.correct}/${p.predicted}/${p.reference}`).join(' '));
 for(const [g,v] of Object.entries(out.role))for(const [a,x] of Object.entries(v))console.log('ROLE',g,a,x.correct+'/'+x.items,'abst',x.abstained,'| meas',`${x.measured.correct}/${x.measured.predicted}/${x.measured.reference}`,'decl',`${x.declared.correct}/${x.declared.predicted}/${x.declared.reference}`,'| allM',x.allMeasured,'allD',x.allDeclared);
 for(const [g,v] of Object.entries(out.attribution))for(const [k,x] of Object.entries(v))console.log('ATTR',g,k,JSON.stringify(x));console.log('LEARNED',JSON.stringify(out.learned));}
