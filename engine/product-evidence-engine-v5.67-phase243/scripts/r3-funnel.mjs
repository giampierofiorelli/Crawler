/** R3 cycle 3 (owner S75): where held-out knowledge is lost. For each blind inventory unit (held-out sections), from the
 * judged translation run (kt-cues.2, fidelity heldout-fix1-tuned with carried-over judgements) and the store comparison:
 *   1 extraction: captured / partial / distorted / omitted; for omitted units, whether any statement or unrecognised
 *     clause exists on the unit's lines (not recognised vs recognised as something else);
 *   2 mapping: for kept units, whether the statements' subject/object identify a taught concept, a typed quantity, or nothing;
 *   3 consultation: whether a decision path reads that statement type (link program: measurements; proxy limits:
 *     not_sufficient / not_comparable with a typed head; acquired axes: enumerations/contrasts).
 * Broken down by unit type and by the store-comparison representational gap. Counts only in public.
 *   node scripts/r3-funnel.mjs LABEL */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const label=process.argv[2];const OUT=`evaluation/r3/funnel-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const KT=await import(D+'knowledge_translation.js');const KL=await import(D+'knowledge_link.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const qk=QK.loadQuantityKnowledge();
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const J=f=>JSON.parse(readFileSync(f,'utf8'));const run=J(join(PE,'runs','translate-heldout-fix1-tuned.json'));const base=J(join(PE,'runs','translate-heldout-first.json'));
const span=u=>{const m=/(\d+)\s*-\s*(\d+)/.exec(String(u.lines));return m?[+m[1],+m[2]]:[+u.lines,+u.lines];};
const CONSUMED=new Set(['not_sufficient','not_comparable']);
const C={};const inc=(o,k)=>o[k]=(o[k]??0)+1;const by=(g,k,v)=>{C[g]??={};C[g][k]??={};inc(C[g][k],v);};
for(const cat of Object.keys(run.detail)){
 const units=J(join(PE,'inventory',`${cat}-heldout.json`)).units;const cmp=new Map(J(join(PE,'compare',`${cat}-heldout.json`)).items.map(x=>[x.unit,x]));
 const fo=J(join(PE,'fidelity','heldout-first',`out-${cat}.json`)),fd=J(join(PE,'fidelity','heldout-fix1-tuned',`out-${cat}.json`));
 const cov=new Map(fo.units.map(x=>[x.unit,x.coverage]));for(const x of fd.units)cov.set(x.unit,x.coverage);
 const st=run.detail[cat].statements;
 const items=store.categoryItems246(cat).filter(i=>i.concept);const concepts=items.map(i=>({id:i.concept.id,statement:i.statement,aliases:i.concept.aliases}));
 for(const u of units){const [a,b]=span(u);const here=st.filter(s=>s.provenance.line>=a&&s.provenance.line<=b);const c=cov.get(u.id)??'unjudged';
  const g=cmp.get(u.id)?.gap||((cmp.get(u.id)?.representable==='yes')?'none':'unstated');
  let stage;
  if(c==='omitted'){stage=here.length?'1b_extracted_other_knowledge':'1a_not_extracted';}
  else if(c==='distorted')stage='1c_extracted_distorted';
  else{const mapped=here.some(s=>[s.subject,s.object].some(x=>x&&KT.identifyConcept(x.text,concepts)));
   const typed=here.some(s=>[s.subject,s.object].some(x=>x&&(x.metrics.length||x.kinds.length)));
   if(!mapped&&!typed)stage='2a_kept_not_mapped';
   else{const consumed=here.some(s=>CONSUMED.has(s.type)&&!s.selfCheck.length&&KT.proxyLimits(qk,[s]).length);
    stage=consumed?'3b_mapped_and_consulted':(mapped?'3a_mapped_to_concept_not_consulted':'3a_typed_quantity_not_consulted');}}
  inc(C,stage);by('byType',u.type,stage);by('byGap',g,stage);if(u.importance==='high')by('high','all',stage);}}
store.close();
writeFileSync(OUT,JSON.stringify({schema:'pee.r3.funnel.v1',label,generatedAt:new Date().toISOString(),
 basis:'held-out units (740), translation kt-cues.2 (TUNED on these sections), blind same-model judgements (first run + delta); store comparison gaps; consumers as of R3 cycle 2',counts:C},null,1)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(C).filter(([k])=>/^\d/.test(k)).sort())));
for(const g of ['byType','byGap'])for(const [k,v] of Object.entries(C[g]).sort((x,y)=>Object.values(y[1]).reduce((a,b)=>a+b)-Object.values(x[1]).reduce((a,b)=>a+b)))console.log(g,k,JSON.stringify(Object.fromEntries(Object.entries(v).sort())));
