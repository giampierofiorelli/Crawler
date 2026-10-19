/** R3 cycle 3: score a concept identifier against a sealed blind alignment reference (counts only).
 *   node scripts/r3-align-score.mjs dev|heldout identify|align0 LABEL */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [side,which,label]=process.argv.slice(2);const OUT=`evaluation/r3/align-${side}-${which}-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: dev|heldout identify|align0|align1 LABEL');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3/align');
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
if(side==='heldout'){const fz=JSON.parse(readFileSync('evaluation/r3/align-freeze.json','utf8'));if(sha(join(PE,'heldout/out.json'))!==fz.heldout.annotation)throw Error('reference changed');}
const D=new URL('../dist/src/',import.meta.url).href;const KT=await import(D+'knowledge_translation.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const inp=JSON.parse(readFileSync(join(PE,side,'in.json'),'utf8')).mentions,ref=new Map(JSON.parse(readFileSync(join(PE,side,'out.json'),'utf8')).mentions.map(x=>[x.mention,x]));
const pool={};const C={};const inc=k=>C[k]=(C[k]??0)+1;
for(const m of inp){pool[m.category]??=(()=>{const s=new Set();return store.categoryItems246(m.category).filter(i=>i.concept&&!s.has(i.concept.id)&&s.add(i.concept.id)).map(i=>({id:i.concept.id,kind:i.concept.kind,statement:i.statement,aliases:i.concept.aliases}));})();
 const a=ref.get(m.mention);const gold=Object.entries(a.matches).filter(([,v])=>v==='exact'||v==='close').map(([k])=>k);
 const QKm=await import(D+'quantity_knowledge.js');const qk=globalThis.__qk??=QKm.loadQuantityKnowledge();
 const dn=KT.denotationOf(qk,m.text);inc('denotation_'+(dn===a.denotes?'correct':'wrong'));inc(`dn_${a.denotes}->${dn}`);
 const pick=which==='identify'?KT.identifyConcept(m.text,pool[m.category]):which==='align1'?KT.alignWithType(qk,m.text,pool[m.category]).concept:KT.alignConcept(m.text,pool[m.category],{role:m.role,statementType:m.statementType}).concept;
 const pm=pick?(gold.includes(pick)?'correct_identity':(a.matches[pick]??'not_in_reference_candidates')):'abstain';
 inc('mentions');if(gold.length)inc('reference_identities');inc('pick_'+pm);if(gold.length&&pm==='abstain')inc('missed_identity');inc('denotes_'+a.denotes);}
store.close();
writeFileSync(OUT,JSON.stringify({schema:'pee.r3.align-score.v1',side,identifier:which,label,generatedAt:new Date().toISOString(),
 tier:side==='heldout'?'first run against the sealed held-out alignment reference':'development reference (inspected)',reference:'blind same-model annotation, SKOS match types; identity = exact or close',counts:C},null,1)+'\n');
console.log(JSON.stringify(C));
