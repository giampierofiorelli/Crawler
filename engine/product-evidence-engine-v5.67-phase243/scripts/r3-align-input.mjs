/** R3 cycle 3: blind alignment reference. Samples mentions (subjects and objects of translated statements) from one
 * side's translation run, retrieves candidate taught concepts liberally (plus one control that shares no word), and
 * writes the private annotation input r3/align/<side>/in.json. The annotation is sealed (hash in
 * evaluation/r3/align-freeze.json) before any validator is written or run on that side.
 *   node scripts/r3-align-input.mjs dev|heldout */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const side=process.argv[2];if(!['dev','heldout','transfer'].includes(side))throw Error('usage: dev|heldout|transfer');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3');
const D=new URL('../dist/src/',import.meta.url).href;const KT=await import(D+'knowledge_translation.js');const KL=await import(D+'knowledge_link.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const run=JSON.parse(readFileSync(join(PE,'runs',side==='dev'?'translate-dev2-cues2.json':side==='transfer'?'translate-transfer.json':'translate-heldout-fix1-tuned.json'),'utf8'));
const h=s=>createHash('sha256').update(s).digest('hex');const N=40;const out=[];
for(const cat of Object.keys(run.detail)){
 const cs=store.categoryItems246(cat).filter(i=>i.concept);const seen=new Set();const concepts=[];for(const i of cs){if(seen.has(i.concept.id))continue;seen.add(i.concept.id);concepts.push({id:i.concept.id,kind:i.concept.kind,statement:i.statement,aliases:i.concept.aliases});}
 const mentions=[];for(const s of run.detail[cat].statements){if(s.selfCheck?.length)continue;for(const role of ['subject','object']){const t=s[role]?.text;if(!t||t.length<4||t.length>160)continue;
  mentions.push({cat,role,type:s.type,text:t,quote:s.quote,heading:s.provenance.headings.at(-1)??''});}}
 const uniq=[...new Map(mentions.map(m=>[m.text.toLowerCase(),m])).values()].map(m=>({m,c:KT.retrieveConcepts(m.text,concepts,4)}));
 // prefer mentions that retrieve something (the alignment question exists); keep some with no candidate as controls
 const withC=uniq.filter(x=>x.c.length).sort((a,b)=>h(a.m.text).localeCompare(h(b.m.text))),noC=uniq.filter(x=>!x.c.length).sort((a,b)=>h(a.m.text).localeCompare(h(b.m.text)));
 for(const x of [...withC.slice(0,N-4),...noC.slice(0,4)]){const ids=new Set(x.c.map(c=>c.id));
  const control=concepts.filter(c=>!ids.has(c.id)&&!KT.retrieveConcepts(x.m.text,[c],1).length).sort((a,b)=>h(x.m.text+a.id).localeCompare(h(x.m.text+b.id)))[0];
  const cands=[...x.c.map(c=>c.id),...(control?[control.id]:[])].sort((a,b)=>h(x.m.text+a).localeCompare(h(x.m.text+b)));
  out.push({mention:'m'+out.length,category:cat,role:x.m.role,statementType:x.m.type,text:x.m.text,quote:x.m.quote,heading:x.m.heading,
   candidates:cands.map(id=>{const c=concepts.find(z=>z.id===id);return {concept:id,kind:c.kind,description:c.statement.replace(/\s*\[[^\]]*\]\s*$/,"").slice(0,300),aliases:(c.aliases??[]).slice(0,8)};}),
   _retrieved:x.c.map(c=>c.id),_control:control?.id??null});}}
store.close();
const dir=join(PE,'align',side);mkdirSync(dir,{recursive:true});const f=join(dir,'in.json');if(existsSync(f))throw Error('exists '+f);
writeFileSync(join(dir,'retrieval.json'),JSON.stringify(out.map(o=>({mention:o.mention,retrieved:o._retrieved,control:o._control})),null,1)+'\n');
writeFileSync(f,JSON.stringify({mentions:out.map(({_retrieved,_control,...o})=>o)},null,1)+'\n');
console.log(side,'mentions',out.length,'candidates',out.reduce((a,o)=>a+o.candidates.length,0),f);
