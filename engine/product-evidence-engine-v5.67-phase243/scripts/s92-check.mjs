#!/usr/bin/env node
/** S92 independent check (evaluation/s92/preregistration.json and amendments 1-3). Pages of private-eval/s92/wave.json.
 * Items: same rule as S89-S91 (every quantity with a QK unit in the text blocks, deduplicated, evenly sampled, <= 40 per page).
 *   items                write the check items (private)
 *   input                write the blind annotator's input: items with their window and block line, and each page's visible text by line
 *   run LABEL            run every role arm and the learning arms on the items (private rows); once per LABEL
 *   score LABEL          score against the sealed reference (evaluation/s92/annotation-freeze.json); public counts
 * Public output: counts only. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');const P=join(homedir(),'.local/share/product-evidence-engine/private-eval');const ROOT=process.env.S92_ROOT??join(P,'s92');
const pub=f=>process.env.S92_PUB?join(process.env.S92_PUB,f):new URL('../evaluation/s92/'+f,import.meta.url).pathname;
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const L=await import(D+'definition_learning.js');const EC=await import(D+'evidence_combination.js');const G=await import(D+'table_interpreter1g.js');const GL=await import(D+'table_interpreter1g_lessons.js');
const DE=await import(D+'document_evidence.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
const [cmd,LABEL]=process.argv.slice(2);const noOverwrite=f=>{if(existsSync(f))throw Error(f+' exists: never overwritten');return f;};
const wave=()=>JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));
const pagesOf=()=>wave().pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval');
const htmlOf=p=>{const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);return b.toString('utf8');};
function itemsFor(){const out=[];
 for(const p of pagesOf()){const html=htmlOf(p);const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').replace(/\s+/g,' ').trim().slice(0,140);
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface,value:q.value??q.low,unit:q.unitSurface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;
  uniq.filter((_,i)=>i%k===0).forEach((a,j)=>{const bl=blocks[a.bi];const ls=Math.max(0,a.start-80);
   out.push({id:`${p.tag}-${j}`,bi:a.bi,start:a.start,page:p.tag,host:new URL(p.url).hostname,category:p.category,title,pageSubject:title.split(/[|:–-]/)[0].replace(/\b(review|tested|test bench|best)\b.*$/i,'').trim()||null,
    value:a.value,unit:a.unit,surface:a.surface,window:bl.slice(Math.max(0,a.start-160),a.end+160),label:bl.slice(ls,a.end+30),valueAt:a.start-ls,context:bl.slice(0,600)});});}
 return out;}
const obsOf=x=>({value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt,surface:x.surface,pageSubject:x.pageSubject});
if(cmd==='items'){const it=itemsFor();writeFileSync(noOverwrite(join(ROOT,'check-items.json')),JSON.stringify(it,null,1));
 console.log(it.length,JSON.stringify(Object.fromEntries([...new Set(it.map(x=>x.category+' @ '+x.host))].map(g=>[g,it.filter(x=>x.category+' @ '+x.host===g).length]))));}
if(cmd==='input'){const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));const dir=join(ROOT,'annotation');mkdirSync(join(dir,'pages'),{recursive:true});
 for(const p of pagesOf()){const blocks=textBlocks225(htmlOf(p),{maxBlocks:3000}).blocks;writeFileSync(noOverwrite(join(dir,'pages',p.tag+'.txt')),blocks.map((b,i)=>`L${i}: ${b.replace(/\s+/g,' ')}`).join('\n'));}
 const f=noOverwrite(join(dir,'items.json'));
 writeFileSync(f,JSON.stringify({labels:{properties:[...defs.properties.values()].map(p=>({id:p.id,meaning:`${p.label} (${p.form}; about: ${p.object})`}))},
  items:it.map(x=>({id:x.id,page:x.page,category:x.category,pageTitle:x.title,line:x.bi,value:x.value,unit:x.unit,surface:x.surface,text:x.window}))},null,1));console.log(it.length,'items',sha(readFileSync(f)));}

// ---- run: every arm, frozen (evaluation/s92/freeze.json)
const EXTRA=['GL11_calculation_inputs_keep_method','GL12_parallel_tables_inherit_links'];
const ROLE={measured_result:'measured_by_publisher',declared_spec:'declared_spec',certified_or_quoted:'quoted_other_source',test_condition:'test_condition',programme_preset:'test_condition',derived:'other'};
const nm=x=>String(x??'').replace(/\s+/g,' ').trim().toLowerCase();
function wdClass(wd,blockText,start,surface){if(!wd)return null;const snip=nm(blockText.slice(Math.max(0,start-25),start+surface.length+10));
 const segs=new Map(wd.segments.map(s=>[s.id,s]));for(const q of wd.quantities){if(q.surface.trim()!==surface.trim())continue;const s=segs.get(q.segment);if(s&&nm(s.text).includes(snip.slice(5,-5)))return q.evidenceClass;}return null;}
const vote=role=>role==='measured_by_publisher'||role==='measured'||role==='derived'?1:role==='declared_spec'||role==='declared'?-1:0;
const nearest=(links,rel)=>{const ls=links.filter(l=>rel.includes(l.relation)).sort((a,b)=>a.rank-b.rank);if(!ls.length)return 0;const top=ls.filter(l=>l.rank===ls[0].rank);const v=new Set(top.map(l=>vote(l.role)));return v.size===1?[...v][0]:0;};
const SIG7=r=>[vote(r.arms.A0.role),vote(r.arms.A1.role),nearest(r.linkObjs,['table_link','table_structure','parallel_table']),nearest(r.linkObjs,['co_occurrence']),nearest(r.linkObjs,['bridge']),r.wd==='publisher_measured'?1:r.wd==='manufacturer_declared'||r.wd==='nominal_certified'?-1:0,r.situation==='episodic'?1:r.situation==='attributive'?-1:0];
const SIG6=r=>{const s=SIG7(r);return [r.arms.A0.reason==='no_other_role'?0:s[0],s[1],s[2],s[3],s[4],s[6]];};
const N7=['A0_structure_first','A1_local_evidence','table_links','co_occurrence','bridge','wd_class','situation'],N6=['A0_with_reason','A1_local_evidence','table_links','co_occurrence','bridge','situation'];
if(cmd==='run'){const f=noOverwrite(join(ROOT,`run-${LABEL}.json`));const it=JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8'));
 const pages=new Map();for(const p of pagesOf()){const html=htmlOf(p);const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;
  const tl=G.interpretDocumentTables1G(html,{lessons:[...GL.activeInterpreterLessons1G(),...EXTRA]});let wd=null;try{wd=DE.readDocumentEvidence(html,qk);}catch{}
  pages.set(p.tag,{blocks,sem:SEM.readDocumentSemantics1D2(html,p.url),model:G.documentModel1G(html),obsDefault:G.interpretDocumentTables1G(html).tables.flatMap(t=>t.observations),obsExtra:tl.tables.flatMap(t=>t.observations),wd});}
 // a 1G block's line in the reader's block list (for the linked-method score)
 const lineOf=(P,text)=>{const t=nm(text).slice(0,60);if(!t)return null;const i=P.blocks.findIndex(b=>nm(b).includes(t)||t.includes(nm(b).slice(0,60))&&nm(b).length>20);return i>=0?i:null;};
 const rows=it.map(x=>{const P=pages.get(x.page);const base=obsOf(x);
  const st=(use,obs)=>x.bi<P.sem.blocks.length?I.documentContextOf(defs,P.sem,P.blocks,x.bi,x.start,use?{rel:{model:P.model,tableObservations:obs},surface:x.surface,value:x.value,use}:undefined):null;
  const r={id:x.id,arms:{}};const run=(arm,structure,model,extra={})=>{const o=I.interpretWithDefinitions(defs,qk,{...base,structure},{roleModel:model,...extra});r.arms[arm]={role:o.role.value?ROLE[o.role.value]??'unresolved':'unresolved',reason:o.role.reason,property:o.property.value};};
  run('A0',st(null),'s90');run('A1',st(null),'evidence');run('B',st({tables:true,prose:false},P.obsDefault),'links');run('B2',st({tables:true,prose:false},P.obsExtra),'links');
  const sC=st({tables:true,prose:true},P.obsExtra);run('C',sC,'links');run('C1',sC,'links',{situation:true});
  r.linkObjs=sC?.links??[];r.container=sC?.container??null;r.wd=wdClass(P.wd,P.blocks[x.bi]??'',x.start,x.surface);
  {const va=x.valueAt;const ss=x.label.slice(0,va).search(/[^.!?]*$/);const sent=x.label.slice(ss);const cut=sent.slice(va-ss).search(/[.!?]\s/);r.situation=I.situationTypeOf(cut>0?sent.slice(0,va-ss+cut+1):sent,va-ss,va-ss+String(x.surface).length);}
  // evidence lines of each link (evaluation only): prose links by their 1G block, table links by the method statements 1G linked to the cell
  r.linkLines=r.linkObjs.map(l=>{if(l.relation==='co_occurrence')return {role:l.role,rank:l.rank,lines:[x.bi]};
   if(l.relation==='bridge'){const b=P.model.blocks.find(b=>b.locator===l.pointer);return {role:l.role,rank:l.rank,lines:b?[lineOf(P,b.text)].filter(v=>v!==null):[]};}
   const m=/^table (\d+) cell (\d+)/.exec(l.pointer);const o=m?P.obsExtra.find(o=>o.table===+m[1]&&o.cell===+m[2]):null;
   return {role:l.role,rank:l.rank,lines:(o?.methodLinks??[]).map(bi=>lineOf(P,P.model.blocks[bi]?.text??'')).filter(v=>v!==null)};});
  return r;});
 // label models: refit on the check items without gold (transductive), and the frozen development models
 const fr=JSON.parse(readFileSync(pub('freeze.json'),'utf8'));const dev2=fr.labelModelD2Dev.model;const dev1=JSON.parse(readFileSync(join(ROOT,'label-model-D-dev.json'),'utf8'));
 if(sha(readFileSync(join(ROOT,'label-model-D2-dev.json')))!==fr.labelModelD2Dev.sha256)throw Error('D2 dev model differs from its freeze');
 const lm7=EC.fitLabelModel(N7,rows.map(SIG7),{margin:0.5}),lm6=EC.fitLabelModel(N6,rows.map(SIG6),{margin:0.5});
 for(const r of rows){const c1=r.arms.C1;const pass=c1.role==='quoted_other_source'||c1.role==='test_condition';
  for(const [arm,lm,sig] of [['D',lm7,SIG7],['Ddev',dev1,SIG7],['D2',lm6,SIG6],['D2dev',dev2,SIG6]]){if(pass){r.arms[arm]={...c1};continue;}const d=EC.predictLabel(lm,sig(r));
   r.arms[arm]={role:d.label===1?'measured_by_publisher':d.label===-1?'declared_spec':'unresolved',reason:'label_model:'+d.voters.join(' '),property:r.arms.A1.property};}}
 // learning arms: inductive (spent S88-S91 only) and transductive (+ the check items, no reference)
 const fr2=fr.learningArms;const srcs=[[join(P,'s88'),'heldout_eval',join(P,'s88/e4-items.json')],[join(P,'s89'),'regression',join(P,'s89/learn-items.json')],[join(P,'s89'),'heldout_eval',join(P,'s89/check-items.json')],[join(P,'s90'),'heldout_eval',join(P,'s90/check-items.json')],[join(P,'s91'),'heldout_eval',join(P,'s91/check-items.json')]];
 const structOf=(R,role)=>{const w=JSON.parse(readFileSync(join(R,'wave.json'),'utf8'));const m=new Map();for(const p of w.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const html=readFileSync(join(R,'raw',p.tag+'.html'),'utf8');const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;m.set(p.tag,{blocks,sem:SEM.readDocumentSemantics1D2(html,p.url)});}return m;};
 const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
 const learnObs=[];for(const [R,role,itemsF] of srcs){const items=JSON.parse(readFileSync(itemsF,'utf8'));const sm=structOf(R,role);const all=[];
  // block positions are rebuilt by the item rule (as s90-learn); items without bi realign by surface
  for(const [tag,{blocks,sem}] of sm){const a=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;a.push({bi,start:q.start,end:q.end,surface:q.surface});}});
   const seen=new Set();const u=a.filter(z=>{const k=blocks[z.bi].slice(Math.max(0,z.start-60),z.end+30);if(seen.has(k))return false;seen.add(k);return true;});const k=Math.ceil(u.length/40)||1;u.filter((_,i)=>i%k===0).forEach((z,j)=>all.push([`${tag}-${j}`,{...z,blocks,sem}]));}
  const pos=new Map(all);for(const x of items){const z=pos.get(x.id);if(!z||z.surface!==x.surface)throw Error('learning item does not realign '+x.id);
   learnObs.push({docId:x.page+'@'+R,publisher:x.host.replace(/^www\./,''),category:x.category,value:x.value,unit:x.unit,label:x.label,context:x.context,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??x.title??null,structure:I.structuralContextOf(defs,z.sem,z.blocks,z.bi,z.start)});}}
 const checkObs=it.map(x=>{const P2=pages.get(x.page);return {...obsOf(x),docId:x.page+'@s92',publisher:x.host.replace(/^www\./,''),structure:I.structuralContextOf(defs,P2.sem,P2.blocks,x.bi,x.start)};});
 const learning={};for(const arm of ['E0','E1','E2','E3'])for(const mode of ['inductive','transductive']){const layer=L.learnFromDocuments(defs,qk,mode==='inductive'?learnObs:[...learnObs,...checkObs],L.DEFAULT_THRESHOLDS,fr2[arm]);
  const d=L.withLearned(qk,defs.pack,layer);learning[arm+'_'+mode]={layer:{terms:layer.terms,proposals:layer.proposals},attribution:Object.fromEntries(checkObs.map((o,i)=>[it[i].id,I.attributeProperty(d,qk,o).value]))};}
 writeFileSync(f,JSON.stringify({label:LABEL,definitions:defs.identity,freeze:sha(readFileSync(pub('freeze.json'))),at:new Date().toISOString(),labelModels:{D:lm7,D2:lm6},rows,learning},null,1));
 console.log(LABEL,'rows',rows.length,'learning',Object.keys(learning).join(','));}
export {wdClass};

// ---- score: sealed reference only (evaluation/s92/annotation-freeze.json); public counts
if(cmd==='score'){const frz=JSON.parse(readFileSync(pub('annotation-freeze.json'),'utf8'));const rb=readFileSync(join(ROOT,'annotation','annotations.json'));if(sha(rb)!==frz.annotationsSha256)throw Error('reference does not match its seal');
 const ref=JSON.parse(rb).items;const run=JSON.parse(readFileSync(join(ROOT,`run-${LABEL}.json`),'utf8'));const it=new Map(JSON.parse(readFileSync(join(ROOT,'check-items.json'),'utf8')).map(x=>[x.id,x]));
 const CL=['measured_by_publisher','declared_spec','quoted_other_source','test_condition','other'];const arms=Object.keys(run.rows[0].arms);
 const roleScore=(rows,arm)=>{const ann=rows.filter(r=>ref[r.id]&&ref[r.id].property!=='none'&&ref[r.id].role);const R=r=>r.arms[arm].role,G=r=>ref[r.id].role;
  const o={annotated:ann.length,correct:ann.filter(r=>R(r)===G(r)).length,abstained:ann.filter(r=>R(r)==='unresolved').length,allMeasured:ann.filter(r=>G(r)==='measured_by_publisher').length,allDeclared:ann.filter(r=>G(r)==='declared_spec').length,perClass:{}};
  for(const c of CL){const g=ann.filter(r=>G(r)===c),pr=ann.filter(r=>R(r)===c),ok=pr.filter(r=>G(r)===c).length;if(g.length||pr.length)o.perClass[c]={reference:g.length,predicted:pr.length,correct:ok,precision:pr.length?+(ok/pr.length).toFixed(3):null,coverage:g.length?+(g.filter(r=>R(r)!=='unresolved').length/g.length).toFixed(3):null,recall:g.length?+(ok/g.length).toFixed(3):null,abstained:g.filter(r=>R(r)==='unresolved').length};}
  for(const b of ['A0','A1'])if(arm!==b)o['vs'+b]={gained:ann.filter(r=>R(r)===G(r)&&r.arms[b].role!==G(r)).length,lost:ann.filter(r=>R(r)!==G(r)&&r.arms[b].role===G(r)).length};
  // linked method: a correct decision whose evidence reaches the reference's evidence line (the item's own line counts for local evidence)
  const tied=ann.filter(r=>R(r)===G(r)&&(G(r)==='measured_by_publisher'||G(r)==='declared_spec')&&ref[r.id].evidenceLine!=null);
  const want=r=>G(r)==='measured_by_publisher'?['measured','derived']:['declared'];const own=r=>it.get(r.id).bi;
  const reach=tied.filter(r=>{const ev=ref[r.id].evidenceLine;if(ev===own(r))return true;return (r.linkLines??[]).some(l=>want(r).includes(l.role)&&l.lines.includes(ev));});
  o.linkedMethod={correctWithReferenceLine:tied.length,evidenceReachesReferenceLine:reach.length,referenceLineElsewhere:tied.filter(r=>ref[r.id].evidenceLine!==own(r)).length,
   reachedElsewhere:reach.filter(r=>ref[r.id].evidenceLine!==own(r)).length};
  return o;};
 const propScore=(get,rows)=>{const s={refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0};for(const r of rows){const a=ref[r.id];if(!a)continue;const v=get(r);
  if(a.property==='none'){s.refNone++;if(v&&v!==a.alsoAcceptable)s.falseAttribution++;}else{s.refPositive++;if(!v)s.abstained++;else if(v===a.property||v===a.alsoAcceptable)s.correct++;else s.wrong++;}}return s;};
 const groups={all:run.rows,...Object.fromEntries([...new Set(run.rows.map(r=>it.get(r.id).category))].map(c=>[c,run.rows.filter(r=>it.get(r.id).category===c)])),
  ...Object.fromEntries([...new Set(run.rows.map(r=>it.get(r.id).category+' @ '+it.get(r.id).host))].map(g=>[g,run.rows.filter(r=>it.get(r.id).category+' @ '+it.get(r.id).host===g)]))};
 const out={schema:'pee.s92.check-score.v1',label:LABEL,reference:frz.annotationsSha256,freeze:run.freeze,arms,
  reference_counts:{items:Object.keys(ref).length,property:run.rows.filter(r=>ref[r.id]?.property!=='none').length,roles:Object.fromEntries(CL.map(c=>[c,run.rows.filter(r=>ref[r.id]?.property!=='none'&&ref[r.id]?.role===c).length])),withEvidenceLine:run.rows.filter(r=>ref[r.id]?.property!=='none'&&ref[r.id]?.evidenceLine!=null).length},
  role:Object.fromEntries(Object.entries(groups).map(([g,rs])=>[g,Object.fromEntries(arms.map(a=>[a,roleScore(rs,a)]))])),
  property:Object.fromEntries(Object.entries(groups).map(([g,rs])=>[g,{base:propScore(r=>r.arms.A1.property,rs),...Object.fromEntries(Object.entries(run.learning).map(([k,v])=>[k,propScore(r=>v.attribution[r.id],rs)]))}])),
  learning:Object.fromEntries(Object.entries(run.learning).map(([k,v])=>[k,{terms:v.layer.terms.length,supported:v.layer.terms.filter(t=>t.state==='supported').length,distributional:v.layer.terms.filter(t=>t.evidence.via==='distributional').length,proposals:v.layer.proposals.length}]))};
 // knowledge-graph induction on the check: reference values outside the definitions with a technical concept name
 {const lay=run.learning.E3_transductive.layer.proposals;const tech=run.rows.filter(r=>ref[r.id]?.property==='none'&&ref[r.id]?.concept&&!/not a technical quantity/i.test(ref[r.id].concept));
  const keyOf=r=>{const lab=nm(it.get(r.id).label);const hits=lay.filter(p=>lab.includes(p.term));return hits.length?hits.sort((a,b)=>b.term.length-a.term.length)[0].key:null;};
  const keyed=tech.map(r=>({c:nm(ref[r.id].concept),k:keyOf(r),cat:it.get(r.id).category}));let samePair=0,sameBoth=0,sameKey=0,sameKeyConcept=0;
  for(let i=0;i<keyed.length;i++)for(let j=i+1;j<keyed.length;j++){const a=keyed[i],b=keyed[j];if(a.c===b.c){samePair++;if(a.k&&a.k===b.k)sameBoth++;}if(a.k&&a.k===b.k){sameKey++;if(a.c===b.c)sameKeyConcept++;}}
  out.kgInduction={referenceTechnicalOutsideDefinitions:tech.length,byCategory:Object.fromEntries([...new Set(keyed.map(x=>x.cat))].map(c=>[c,{values:keyed.filter(x=>x.cat===c).length,covered:keyed.filter(x=>x.cat===c&&x.k).length}])),
   coveredByAProposal:keyed.filter(x=>x.k).length,distinctReferenceConcepts:new Set(keyed.map(x=>x.c)).size,proposals:lay.length,
   pairs:{sameReferenceConcept:samePair,ofWhichSameProposal:sameBoth,sameProposal:sameKey,ofWhichSameReferenceConcept:sameKeyConcept}};}
 writeFileSync(noOverwrite(pub(`check-${LABEL}.json`)),JSON.stringify(out,null,1)+'\n');
 const f=v=>{const m=v.perClass.measured_by_publisher??{},d=v.perClass.declared_spec??{};return `${v.correct}/${v.annotated} abst ${v.abstained} | meas P ${m.precision} R ${m.recall} (${m.correct}/${m.predicted} of ${m.reference}) | decl P ${d.precision} R ${d.recall} (${d.correct}/${d.predicted} of ${d.reference})`+(v.vsA0?` | vsA0 +${v.vsA0.gained}/-${v.vsA0.lost}`:'')+` | linked ${v.linkedMethod.reachedElsewhere}/${v.linkedMethod.referenceLineElsewhere}`;};
 console.log('reference',JSON.stringify(out.reference_counts));for(const [g,v] of Object.entries(out.role)){console.log('==',g,'baselines meas',v.A0.allMeasured,'decl',v.A0.allDeclared);for(const [a,x] of Object.entries(v))console.log('  ',a.padEnd(6),f(x));}
 for(const [g,v] of Object.entries(out.property))console.log('PROP',g,JSON.stringify(v));console.log('LEARN',JSON.stringify(out.learning));console.log('KG',JSON.stringify(out.kgInduction));}
export {itemsFor,obsOf,pagesOf,htmlOf};
