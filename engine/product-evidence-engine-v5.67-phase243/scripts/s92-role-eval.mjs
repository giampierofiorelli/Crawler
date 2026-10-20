#!/usr/bin/env node
/** S92 (evaluation/s92/preregistration.json): the role arms on waves whose items and blind references exist.
 * A0 S90 role model; A1 S91 positive evidence; B A1 + 1G table links (default lessons); B2 B with GL11/GL12;
 * C B2 + evidence selection in prose (co-occurrence, bridge); D label model over the signals (see evidence_combination).
 * Per role: precision, coverage, recall, abstention; errors introduced / results lost against A0 and A1; provenance by link.
 *   node scripts/s92-role-eval.mjs --sets ROOT:ROLE:ITEMS:REF,... [--out PUBLIC] [--detail PRIVATE] [--arms A0,A1,B,B2,C,D] [--lm MODEL.json]
 * Public output: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');const G=await import(D+'table_interpreter1g.js');const GL=await import(D+'table_interpreter1g_lessons.js');
const DE=await import(D+'document_evidence.js');const EC=await import(D+'evidence_combination.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);
const ARMS=(arg('arms')??'A0,A1,B,B2,C,C1,D,D2').split(',');
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
const EXTRA=['GL11_calculation_inputs_keep_method','GL12_parallel_tables_inherit_links'];
/** Rebuild each page's readings and the items' block positions (same rule as the S89-S91 item builders). */
export function pageReadings(ROOT,role){const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));const out=new Map();
 for(const p of wave.pages.filter(p=>p.outcome==='fetched'&&p.role===role)){const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);const html=b.toString('utf8');
  const blocks=textBlocks225(html,{maxBlocks:3000}).blocks;const sem=SEM.readDocumentSemantics1D2(html,p.url);const model=G.documentModel1G(html);
  const obsDefault=G.interpretDocumentTables1G(html).tables.flatMap(t=>t.observations);
  const obsExtra=G.interpretDocumentTables1G(html,{lessons:[...GL.activeInterpreterLessons1G(),...EXTRA]}).tables.flatMap(t=>t.observations);
  let wd=null;try{wd=DE.readDocumentEvidence(html,qk);}catch{}
  const all=[];blocks.forEach((bl,bi)=>{for(const q of QK.findQuantities(qk,bl)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface,value:q.value??q.low});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;uniq.filter((_,i)=>i%k===0).forEach((a,j)=>out.set(`${p.tag}-${j}`,{...a,page:{blocks,sem,model,obsDefault,obsExtra,wd}}));}
 return out;}
const ROLE={measured_result:'measured_by_publisher',declared_spec:'declared_spec',certified_or_quoted:'quoted_other_source',test_condition:'test_condition',programme_preset:'test_condition',derived:'other'};
/** WD evidence class of the item's value (the same printed value in the same sentence), as a signal. */
function wdClass(wd,blockText,start,surface){if(!wd)return null;const snip=blockText.slice(Math.max(0,start-25),start+surface.length+10).replace(/\s+/g,' ').trim().toLowerCase();
 const segs=new Map(wd.segments.map(s=>[s.id,s]));for(const q of wd.quantities){if(q.surface.trim()!==surface.trim())continue;const s=segs.get(q.segment);if(s&&s.text.replace(/\s+/g,' ').toLowerCase().includes(snip.slice(5,-5)))return q.evidenceClass;}return null;}
const rows=[];
for(const s of (arg('sets')??'').split(',').filter(Boolean)){const [ROOT,role,itemsF,refF]=s.split(':');const ctx=pageReadings(ROOT,role);const items=JSON.parse(readFileSync(itemsF,'utf8'));const ref=JSON.parse(readFileSync(refF,'utf8')).items;
 for(const x of items){const c=ctx.get(x.id);if(!c||c.surface!==x.surface)throw Error('item does not realign '+x.id);const a=ref[x.id];const P=c.page;
  const base={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt??locate(x),surface:x.surface,pageSubject:x.pageSubject??null};
  const st=(use,obs)=>c.bi<P.sem.blocks.length?I.documentContextOf(defs,P.sem,P.blocks,c.bi,c.start,use?{rel:{model:P.model,tableObservations:obs},surface:c.surface,value:c.value,use}:undefined):null;
  const r={set:ROOT.split('/').pop(),id:x.id,host:x.host,refProperty:a.property,also:a.alsoAcceptable??null,refRole:a.role??null,arms:{},links:{}};
  const run=(arm,structure,model)=>{const out=I.interpretWithDefinitions(defs,qk,{...base,structure},{roleModel:model});r.arms[arm]={role:out.role.value?ROLE[out.role.value]??'unresolved':'unresolved',reason:out.role.reason,property:out.property.value};return out;};
  run('A0',st(null),'s90');run('A1',st(null),'evidence');
  const sB=st({tables:true,prose:false},P.obsDefault);run('B',sB,'links');
  const sB2=st({tables:true,prose:false},P.obsExtra);run('B2',sB2,'links');
  const sC=st({tables:true,prose:true},P.obsExtra);run('C',sC,'links');r.links=(sC?.links??[]).map(l=>`${l.relation}:${l.scope}:${l.role}:${l.rank}`);
  const c1=I.interpretWithDefinitions(defs,qk,{...base,structure:sC},{roleModel:'links',situation:true});r.arms.C1={role:c1.role.value?ROLE[c1.role.value]??'unresolved':'unresolved',reason:c1.role.reason,property:c1.property.value};
  {const va=base.valueAt;if(va!=null){const ss=x.label.slice(0,va).search(/[^.!?]*$/);const sent=x.label.slice(ss);const cut=sent.slice(va-ss).search(/[.!?]\s/);r.situation=I.situationTypeOf(cut>0?sent.slice(0,va-ss+cut+1):sent,va-ss,va-ss+String(x.surface).length);}else r.situation=null;}
  r.wd=wdClass(P.wd,P.blocks[c.bi]??'',c.start,c.surface);r.container=sC?.container??null;
  rows.push(r);}}
// D: label model over seven signals; no gold is read when fitting
export const SIGNALS92=['A0_structure_first','A1_local_evidence','table_links','co_occurrence','bridge','wd_class','situation'];
const vote=role=>role==='measured_by_publisher'||role==='measured'||role==='derived'?1:role==='declared_spec'||role==='declared'?-1:0;
const nearest=(r,rel)=>{const ls=r.links.map(l=>l.split(':')).filter(l=>rel.includes(l[0])).sort((a,b)=>+a[3]-+b[3]);if(!ls.length)return 0;const top=ls.filter(l=>l[3]===ls[0][3]);const v=new Set(top.map(l=>vote(l[2])));return v.size===1?[...v][0]:0;};
export const signalsOf92=r=>[vote(r.arms.A0.role),vote(r.arms.A1.role),nearest(r,['table_link','table_structure','parallel_table']),nearest(r,['co_occurrence']),nearest(r,['bridge']),
 r.wd==='publisher_measured'?1:r.wd==='manufacturer_declared'||r.wd==='nominal_certified'?-1:0,r.situation==='episodic'?1:r.situation==='attributive'?-1:0];
if(ARMS.includes('D')){const lmF=arg('lm');const lm=lmF&&existsSync(lmF)?JSON.parse(readFileSync(lmF,'utf8')):EC.fitLabelModel(SIGNALS92,rows.map(signalsOf92),{margin:Number(arg('margin')??0.5)});
 if(lmF&&!existsSync(lmF))writeFileSync(lmF,JSON.stringify(lm,null,1)+'\n');console.log('label model',JSON.stringify({acc:Object.fromEntries(lm.signals.map((x,i)=>[x,lm.accuracy[i]])),cov:lm.coverage,notes:lm.notes}));
 for(const r of rows){const c1=r.arms.C1;if(c1.role==='quoted_other_source'||c1.role==='test_condition'){r.arms.D={...c1};continue;}
  const d=EC.predictLabel(lm,signalsOf92(r));r.arms.D={role:d.label===1?'measured_by_publisher':d.label===-1?'declared_spec':'unresolved',reason:'label_model:'+d.voters.join(' ')+' score '+d.score,property:r.arms.A1.property};}}
// D2 (reformulation 2): labelling functions abstain without evidence (data programming): A0 votes only with a reason other
// than its default ('no_other_role'); WD is left out because its page-level default cannot be told from its evidence
export const SIGNALS92b=['A0_with_reason','A1_local_evidence','table_links','co_occurrence','bridge','situation'];
export const signalsOf92b=r=>{const s=signalsOf92(r);return [r.arms.A0.reason==='no_other_role'?0:s[0],s[1],s[2],s[3],s[4],s[6]];};
if(ARMS.includes('D2')){const lmF=arg('lm2');const lm=lmF&&existsSync(lmF)?JSON.parse(readFileSync(lmF,'utf8')):EC.fitLabelModel(SIGNALS92b,rows.map(signalsOf92b),{margin:Number(arg('margin')??0.5)});
 if(lmF&&!existsSync(lmF))writeFileSync(lmF,JSON.stringify(lm,null,1)+'\n');console.log('label model D2',JSON.stringify({acc:Object.fromEntries(lm.signals.map((x,i)=>[x,lm.accuracy[i]])),cov:lm.coverage,notes:lm.notes}));
 for(const r of rows){const c1=r.arms.C1;if(c1.role==='quoted_other_source'||c1.role==='test_condition'){r.arms.D2={...c1};continue;}
  const d=EC.predictLabel(lm,signalsOf92b(r));r.arms.D2={role:d.label===1?'measured_by_publisher':d.label===-1?'declared_spec':'unresolved',reason:'label_model:'+d.voters.join(' ')+' score '+d.score,property:r.arms.A1.property};}}
const CLASSES=['measured_by_publisher','declared_spec','quoted_other_source','test_condition','other'];
const roleScore=(rs,arm)=>{const ann=rs.filter(r=>r.refProperty!=='none'&&r.refRole&&r.arms[arm]);const R=r=>r.arms[arm].role;
 const out={annotated:ann.length,abstained:ann.filter(r=>R(r)==='unresolved').length,correct:ann.filter(r=>R(r)===r.refRole).length,
  baselineAllMeasured:ann.filter(r=>r.refRole==='measured_by_publisher').length,baselineAllDeclared:ann.filter(r=>r.refRole==='declared_spec').length,perClass:{}};
 for(const c of CLASSES){const gold=ann.filter(r=>r.refRole===c),pred=ann.filter(r=>R(r)===c);const ok=pred.filter(r=>r.refRole===c).length;
  if(gold.length||pred.length)out.perClass[c]={reference:gold.length,predicted:pred.length,correct:ok,precision:pred.length?+(ok/pred.length).toFixed(3):null,
   coverage:gold.length?+(gold.filter(r=>R(r)!=='unresolved').length/gold.length).toFixed(3):null,recall:gold.length?+(ok/gold.length).toFixed(3):null,abstained:gold.filter(r=>R(r)==='unresolved').length};}
 for(const ref of ['A0','A1'])if(arm!==ref){const both=ann.filter(r=>r.arms[ref]);out['vs'+ref]={gained:both.filter(r=>R(r)===r.refRole&&r.arms[ref].role!==r.refRole).length,lost:both.filter(r=>R(r)!==r.refRole&&r.arms[ref].role===r.refRole).length};}
 const prov={};if(arm!=='D')for(const r of ann.filter(r=>R(r)!=='unresolved'))for(const k of String(r.arms[arm].reason??'').replace(/^nearest:/,'').split('+')){const key=k.split(':').slice(0,2).join(':');prov[key]=(prov[key]??0)+1;}out.decidedBy=prov;
 return out;};
const sets=[...new Set(rows.map(r=>r.set))];const armsRun=Object.keys(rows[0]?.arms??{});
const out={schema:'pee.s92.role-eval.v1',definitions:defs.identity,arms:armsRun,overall:Object.fromEntries(armsRun.map(a=>[a,roleScore(rows,a)])),
 bySet:Object.fromEntries(sets.map(s=>[s,Object.fromEntries(armsRun.map(a=>[a,roleScore(rows.filter(r=>r.set===s),a)]))]))};
if(arg('out')){if(existsSync(arg('out')))throw Error('exists '+arg('out'));writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}if(arg('detail'))writeFileSync(arg('detail'),JSON.stringify(rows,null,1));
const fmt=(v)=>{const m=v.perClass.measured_by_publisher??{},d=v.perClass.declared_spec??{};return `correct ${v.correct}/${v.annotated} abst ${v.abstained} | meas P ${m.precision} R ${m.recall} (${m.correct}/${m.predicted}) | decl P ${d.precision} R ${d.recall} (${d.correct}/${d.predicted})`+(v.vsA0?` | vsA0 +${v.vsA0.gained}/-${v.vsA0.lost}`:'')+(v.vsA1?` vsA1 +${v.vsA1.gained}/-${v.vsA1.lost}`:'');};
for(const [a,v] of Object.entries(out.overall))console.log('ALL',a.padEnd(3),fmt(v));
for(const s of sets){console.log(s,'baselines meas',out.bySet[s].A0.baselineAllMeasured,'decl',out.bySet[s].A0.baselineAllDeclared);for(const [a,v] of Object.entries(out.bySet[s]))console.log('  ',a.padEnd(3),fmt(v));}
