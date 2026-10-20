#!/usr/bin/env node
/** S93 development (spent S89/S91 pages; reference private-eval/s93/nature-dev, sealed in evaluation/s93/nature-dev-freeze.json):
 * nature (measured / calculated / declared / condition), provenance, calculation assumptions and statement links.
 * Arms: R0 = S92 C1 (first statement in document order; nature read from the role as S92 reported it: derived counted as
 * measured); R1 = C1 with argument-based statement choice and the separate provenance x nature reading.
 *   node scripts/s93-nature-eval.mjs [--out PUBLIC] [--detail PRIVATE]   Public output: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const sha=b=>createHash('sha256').update(b).digest('hex');
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval');const A=join(P,'s93/nature-dev');
const fz=JSON.parse(readFileSync(new URL('../evaluation/s93/nature-dev-freeze.json',import.meta.url),'utf8'));if(sha(readFileSync(join(A,'annotations.json')))!==fz.annotationsSha256)throw Error('reference does not match its seal');
const ref=JSON.parse(readFileSync(join(A,'annotations.json'),'utf8')).items;const items=JSON.parse(readFileSync(join(A,'items.json'),'utf8')).items;
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const G=await import(D+'table_interpreter1g.js');const GL=await import(D+'table_interpreter1g_lessons.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const SEM=await import(D+'document_semantics.js');
const qk=QK.loadQuantityKnowledge();const defs=PD.loadPropertyDefinitions(qk);const EXTRA=['GL11_calculation_inputs_keep_method','GL12_parallel_tables_inherit_links'];
const instr=Object.values(defs.dimensions.get('instrument')?.values??{}).flat();const nm=x=>String(x??'').replace(/\s+/g,' ').trim().toLowerCase();
const pages=new Map();const pageOf=(S,tag)=>{const k=S+'-'+tag;if(pages.has(k))return pages.get(k);const R=join(P,S);const wave=JSON.parse(readFileSync(join(R,'wave.json'),'utf8'));const p=wave.pages.find(x=>x.tag===tag);
 const html=readFileSync(join(R,'raw',tag+'.html'),'utf8');const v={html,blocks:textBlocks225(html,{maxBlocks:3000}).blocks,sem:SEM.readDocumentSemantics1D2(html,p.url),model:G.documentModel1G(html),
  obs:G.interpretDocumentTables1G(html,{lessons:[...GL.activeInterpreterLessons1G(),...EXTRA]}).tables.flatMap(t=>t.observations),title:(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]??'').trim()};pages.set(k,v);return v;};
const lineOf=(pg,text)=>{const t=nm(text).slice(0,60);if(!t)return null;const i=pg.blocks.findIndex(b=>nm(b).includes(t)||t.includes(nm(b).slice(0,60))&&nm(b).length>20);return i>=0?i:null;};
const setItems=new Map();const full=(S,id)=>{if(!setItems.has(S))setItems.set(S,new Map(JSON.parse(readFileSync(join(P,S,'check-items.json'),'utf8')).map(x=>[x.id,x])));return setItems.get(S).get(id);};
const NAT={measured_result:'measured',declared_spec:'declared',certified_or_quoted:'declared',test_condition:'condition',programme_preset:'condition',derived:'measured'};
const PROV={measured_result:'publisher',declared_spec:'manufacturer',certified_or_quoted:'third_party',test_condition:'publisher',programme_preset:'publisher',derived:'publisher'};
const rows=[];
for(const it of items){const [S,id]=it.id.split(':');const tag=it.page.slice(S.length+1);const pg=pageOf(S,tag);const x=full(S,id);const a=ref[it.id];
 const locate=()=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((p,q)=>Math.abs(p-80)-Math.abs(q-80))[0]:null;};
 const base={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt??locate(),surface:x.surface,pageSubject:x.pageSubject??null,frame:pg.title};
 const start=pg.blocks[it.line].indexOf(x.surface)>=0?pg.blocks[it.line].indexOf(x.surface):0;const rel={model:pg.model,tableObservations:pg.obs};
 const st=sel=>it.line<pg.sem.blocks.length?I.documentContextOf(defs,pg.sem,pg.blocks,it.line,start,{rel,surface:x.surface,value:x.value,use:{tables:true,prose:true,selection:sel,subject:pg.title,instrumentTerms:instr}}):null;
 const s0=st('first'),s1=st('argument');
 const r0=I.interpretWithDefinitions(defs,qk,{...base,structure:s0},{roleModel:'links',situation:true});
 const r1=I.interpretWithDefinitions(defs,qk,{...base,structure:s1},{roleModel:'links',situation:true,provenance:true,relations:rel});
 const lines=links=>[...new Set(links.flatMap(l=>(l.statements??[]).map(s=>s.block<0?it.line:lineOf(pg,pg.model.blocks[s.block]?.text??''))).filter(v=>v!==null))];
 const r0lines=lines((s0?.links??[]).filter(l=>l.rank===Math.min(...(s0?.links??[]).map(z=>z.rank))));
 const r1lines=(r1.evidence?.statements??[]).map(s=>s.line!=null?s.line:s.block<0?it.line:lineOf(pg,pg.model.blocks[s.block]?.text??'')).filter(v=>v!==null);
 const asText=(r1.evidence?.calculation?.assumptions??[]).map(z=>z.text);
 rows.push({id:it.id,set:S,ref:a,line:it.line,
  R0:{nature:r0.role.value&&r0.role.value!=='unresolved'?NAT[r0.role.value]:'unresolved',provenance:r0.role.value&&r0.role.value!=='unresolved'?PROV[r0.role.value]:'unresolved',lines:r0.role.reason&&/co_occurrence|bridge|table_|parallel/.test(r0.role.reason)?r0lines:[it.line]},
  R1:{nature:r1.evidence?.nature??'unresolved',provenance:r1.evidence?.provenance??'unresolved',lines:r1lines,assumptions:asText,
   assumptionLinesFound:(a.assumptionLines??[]).filter(L=>asText.some(t=>nm(pg.blocks[L]??'').includes(nm(t)))).length}});}
const CL=['measured','calculated','declared','condition'];
const score=(rs,arm)=>{const o={items:rs.length,correct:rs.filter(r=>r[arm].nature===r.ref.nature).length,abstained:rs.filter(r=>r[arm].nature==='unresolved').length,perClass:{},provenance:{correct:rs.filter(r=>r[arm].provenance===r.ref.provenance).length,abstained:rs.filter(r=>r[arm].provenance==='unresolved').length}};
 for(const c of CL){const g=rs.filter(r=>r.ref.nature===c),p=rs.filter(r=>r[arm].nature===c),ok=p.filter(r=>r.ref.nature===c).length;o.perClass[c]={reference:g.length,predicted:p.length,correct:ok,precision:p.length?+(ok/p.length).toFixed(3):null,recall:g.length?+(ok/g.length).toFixed(3):null,abstained:g.filter(r=>r[arm].nature==='unresolved').length};}
 const el=rs.filter(r=>r.ref.evidenceLine!=null&&r[arm].nature===r.ref.nature&&r[arm].nature!=='unresolved');
 o.links={correctWithReferenceLine:el.length,reachesLine:el.filter(r=>r[arm].lines.includes(r.ref.evidenceLine)).length,elsewhere:el.filter(r=>r.ref.evidenceLine!==r.line).length,reachesElsewhere:el.filter(r=>r.ref.evidenceLine!==r.line&&r[arm].lines.includes(r.ref.evidenceLine)).length};
 if(arm==='R1'){const calc=rs.filter(r=>r.ref.nature==='calculated');o.assumptions={calculatedWithReferenceAssumptions:calc.filter(r=>r.ref.assumptionLines?.length).length,foundAtLeastOne:calc.filter(r=>r.R1.assumptionLinesFound>0).length};}
 return o;};
const out={schema:'pee.s93.nature-dev.v1',reference:fz.annotationsSha256,note:'development on spent material (TUNED by definition)',overall:{R0:score(rows,'R0'),R1:score(rows,'R1')},bySet:Object.fromEntries(['s89','s91'].map(S=>[S,{R0:score(rows.filter(r=>r.set===S),'R0'),R1:score(rows.filter(r=>r.set===S),'R1')}]))};
if(arg('out')){if(existsSync(arg('out')))throw Error('exists');writeFileSync(arg('out'),JSON.stringify(out,null,1)+'\n');}if(arg('detail'))writeFileSync(arg('detail'),JSON.stringify(rows,null,1));
for(const [arm,v] of Object.entries(out.overall)){console.log(arm,'nature',v.correct+'/'+v.items,'abst',v.abstained,'prov',v.provenance.correct,'links',JSON.stringify(v.links),v.assumptions?JSON.stringify(v.assumptions):'');for(const [c,p] of Object.entries(v.perClass))console.log('   ',c.padEnd(11),JSON.stringify(p));}
