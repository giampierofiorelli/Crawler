#!/usr/bin/env node
/** S94 Stage 2 (evaluation/s94/preregistration-stage2.json): hybrid vector-symbolic alignment.
 *   node scripts/s94-align.mjs input                      new blind reference input r3/align/s94/in.json (pooled candidates)
 *   node scripts/s94-align.mjs score SIDE LABEL [--out]   SIDE dev|heldout|transfer|s94; every arm; public counts only */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,statSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'));const R3=join(PE,'r3');
const D=new URL('../dist/src/',import.meta.url).href;const KT=await import(D+'knowledge_translation.js');const QK=await import(D+'quantity_knowledge.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {relations247}=await import(D+'phase247_category_relations.js');
const qk=QK.loadQuantityKnowledge();const h=s=>createHash('sha256').update(s).digest('hex');const shaF=f=>h(readFileSync(f));
const [cmd,SIDE,LABEL]=process.argv.slice(2);
// corpus: every Markdown file of the owner's research packages, split into paragraphs
const walk=d=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?walk(p):/\.md$/i.test(f)?[p]:[];});
const files=walk(join(PE,'r1v/packages')).sort();const paras=files.flatMap(f=>readFileSync(f,'utf8').split(/\n\s*\n/)).filter(p=>p.trim().length>20);
const model=KT.trainDistributional(paras,{window:5,minCount:3});
const corpus={files:files.length,paragraphs:paras.length,vocabulary:model.vocab,digest:h(files.map(f=>shaF(f)).join(''))};
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));const pools={};
const poolOf=cat=>pools[cat]??=(()=>{const items=store.categoryItems246(cat);const byItem=new Map(items.map(i=>[i.itemId,i]));const seen=new Set();const out=[];
 for(const i of items){if(!i.concept||seen.has(i.concept.id))continue;seen.add(i.concept.id);out.push({id:i.concept.id,kind:i.concept.kind,statement:i.statement,aliases:i.concept.aliases??[],neighbors:[]});}
 for(const r of relations247(store,cat)){const a=r.from.startsWith('item:')?byItem.get(r.from.slice(5))?.concept?.id:null,b=r.to.startsWith('item:')?byItem.get(r.to.slice(5))?.concept?.id:null;
  const A=out.find(c=>c.id===a),B=out.find(c=>c.id===b);if(A&&b)A.neighbors.push({id:b,relation:r.kind});if(B&&a)B.neighbors.push({id:a,relation:r.kind+' of'});}
 return out;})();
if(cmd==='input'){const dir=join(R3,'align','s94');const f=join(dir,'in.json');if(existsSync(f))throw Error('exists '+f);
 const run=JSON.parse(readFileSync(join(R3,'runs','translate-transfer.json'),'utf8'));const used=new Set(JSON.parse(readFileSync(join(R3,'align','transfer','in.json'),'utf8')).mentions.map(m=>m.text.toLowerCase()));
 const N=40;const out=[];
 for(const cat of Object.keys(run.detail)){const concepts=poolOf(cat);const mentions=[];
  for(const s of run.detail[cat].statements){if(s.selfCheck?.length)continue;for(const role of ['subject','object']){const t=s[role]?.text;if(!t||t.length<4||t.length>160||used.has(t.toLowerCase()))continue;
   mentions.push({role,type:s.type,text:t,quote:s.quote,heading:s.provenance.headings.at(-1)??''});}}
  const uniq=[...new Map(mentions.map(m=>[m.text.toLowerCase(),m])).values()].map(m=>{const lex=KT.retrieveConcepts(m.text,concepts,4).map(c=>c.id),vec=KT.vectorRetrieve(model,m.text,concepts,4,true).map(c=>c.id);return {m,lex,vec};});
  const withC=uniq.filter(x=>x.lex.length||x.vec.length).sort((a,b)=>h('s94'+a.m.text).localeCompare(h('s94'+b.m.text))),noC=uniq.filter(x=>!x.lex.length&&!x.vec.length).sort((a,b)=>h('s94'+a.m.text).localeCompare(h('s94'+b.m.text)));
  for(const x of [...withC.slice(0,N-4),...noC.slice(0,4)]){const ids=new Set([...x.lex,...x.vec]);
   const control=concepts.filter(c=>!ids.has(c.id)&&!KT.retrieveConcepts(x.m.text,[c],1).length).sort((a,b)=>h(x.m.text+a.id).localeCompare(h(x.m.text+b.id)))[0];
   const cands=[...ids,...(control?[control.id]:[])].sort((a,b)=>h(x.m.text+a).localeCompare(h(x.m.text+b)));
   out.push({mention:'m'+out.length,category:cat,role:x.m.role,statementType:x.m.type,text:x.m.text,quote:x.m.quote,heading:x.m.heading,
    candidates:cands.map(id=>{const c=concepts.find(z=>z.id===id);return {concept:id,kind:c.kind,description:c.statement.replace(/\s*\[[^\]]*\]\s*$/,'').slice(0,300),aliases:(c.aliases??[]).slice(0,8)};}),
    _lex:x.lex,_vec:x.vec,_control:control?.id??null});}}
 mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'retrieval.json'),JSON.stringify({corpus,mentions:out.map(o=>({mention:o.mention,lexical:o._lex,vector:o._vec,control:o._control}))},null,1)+'\n');
 writeFileSync(f,JSON.stringify({mentions:out.map(({_lex,_vec,_control,...o})=>o)},null,1)+'\n');
 console.log('mentions',out.length,'candidates',out.reduce((a,o)=>a+o.candidates.length,0),'vector-only candidates',out.reduce((a,o)=>a+o._vec.filter(v=>!o._lex.includes(v)).length,0),JSON.stringify(corpus));}
if(cmd==='score'){const dir=join(R3,'align',SIDE);const outF=`evaluation/s94/align-${SIDE}-${LABEL}.json`;if(process.argv.includes('--out')&&existsSync(outF))throw Error('exists '+outF);
 if(SIDE==='heldout'||SIDE==='transfer'){const fz=JSON.parse(readFileSync('evaluation/r3/align-freeze.json','utf8'));if(shaF(join(dir,'out.json'))!==fz[SIDE].annotation)throw Error('reference changed');}
 if(SIDE==='s94'){const fz=JSON.parse(readFileSync('evaluation/s94/align-freeze.json','utf8'));if(shaF(join(dir,'out.json'))!==fz.annotation)throw Error('reference changed');}
 const inp=JSON.parse(readFileSync(join(dir,'in.json'),'utf8')).mentions,ref=new Map(JSON.parse(readFileSync(join(dir,'out.json'),'utf8')).mentions.map(x=>[x.mention,x]));
 const ARMS={identify:null,align1:null,H:{model,graph:true},'H-novector':{model:null},'H-nograph':{model,graph:false},'H-notyping':{model,graph:true,typing:false}};
 const res={};const detail=[];
 for(const [arm,cfg] of Object.entries(ARMS)){const C={mentions:0,referenceIdentities:0,decided:0,correct:0,relatedPromoted:0,hierarchyPromoted:0,noneOrUnannotatedPromoted:0,missed:0,
   hierarchy:{predicted:0,correct:0,unannotated:0},incompatibleOnIdentity:0,incompatiblePredicted:0,relatedPredicted:0,relatedCorrect:0,retrieval:{identitiesLexical:0,identitiesVector:0,identitiesEither:0}};
  for(const m of inp){const a=ref.get(m.mention);const pool=poolOf(m.category);const gold=Object.entries(a.matches).filter(([,v])=>v==='exact'||v==='close').map(([k])=>k);C.mentions++;if(gold.length)C.referenceIdentities++;
   let pick=null,cands=[];
   if(arm==='identify')pick=KT.identifyConcept(m.text,pool);else if(arm==='align1')pick=KT.alignWithType(qk,m.text,pool).concept;
   else{const r=KT.alignHybrid(qk,m.text,pool,cfg);pick=r.concept;cands=r.candidates;
    for(const c of cands){const g=a.matches[c.id];if(c.relation==='broader'||c.relation==='narrower'){C.hierarchy.predicted++;if(g===undefined)C.hierarchy.unannotated++;else if(g===c.relation)C.hierarchy.correct++;}
     if(c.relation==='incompatible'){C.incompatiblePredicted++;if(g==='exact'||g==='close')C.incompatibleOnIdentity++;}
     if(c.relation==='related'){C.relatedPredicted++;if(g==='related'||g==='broader'||g==='narrower')C.relatedCorrect++;}}
    if(arm==='H')for(const gid of gold){const lexIds=KT.retrieveConcepts(m.text,pool,5).map(c=>c.id),vecIds=KT.vectorRetrieve(model,m.text,pool,5,true).map(c=>c.id);
     if(lexIds.includes(gid))C.retrieval.identitiesLexical++;if(vecIds.includes(gid))C.retrieval.identitiesVector++;if(lexIds.includes(gid)||vecIds.includes(gid))C.retrieval.identitiesEither++;}}
   if(pick){C.decided++;const g=a.matches[pick];if(gold.includes(pick))C.correct++;else if(g==='related')C.relatedPromoted++;else if(g==='broader'||g==='narrower')C.hierarchyPromoted++;else C.noneOrUnannotatedPromoted++;}
   if(gold.length&&!gold.includes(pick))C.missed++;
   if(arm==='H')detail.push({mention:m.mention,text:m.text,gold,pick,cands:cands.map(c=>({id:c.id,rel:c.relation,ref:a.matches[c.id]??null,via:c.via,sim:c.similarity,checks:c.checks}))});}
  C.precision=C.decided?+(C.correct/C.decided).toFixed(3):null;C.recall=C.referenceIdentities?+(C.correct/C.referenceIdentities).toFixed(3):null;res[arm]=C;}
 const out={schema:'pee.s94.align-score.v1',side:SIDE,label:LABEL,corpus,tier:SIDE==='s94'?'first run against the new sealed blind reference':SIDE==='transfer'?'S76 frozen examples (examined once in S76: second use, not blind)':'development reference (examined)',arms:res};
 if(process.argv.includes('--out'))writeFileSync(outF,JSON.stringify(out,null,1)+'\n');mkdirSync(join(PE,'s94'),{recursive:true});writeFileSync(join(PE,'s94',`align-${SIDE}-${LABEL}-detail.json`),JSON.stringify(detail,null,1));
 for(const [a,c] of Object.entries(res))console.log(SIDE,a.padEnd(11),'ids',c.referenceIdentities,'decided',c.decided,'correct',c.correct,'P',c.precision,'R',c.recall,'relPromoted',c.relatedPromoted,'hierPromoted',c.hierarchyPromoted,'otherWrong',c.noneOrUnannotatedPromoted,'| hier',JSON.stringify(c.hierarchy),'incompat',c.incompatiblePredicted+'/'+c.incompatibleOnIdentity,'rel',c.relatedCorrect+'/'+c.relatedPredicted,a==='H'?'retr '+JSON.stringify(c.retrieval):'');}
store.close();
