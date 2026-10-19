/** R3 cycle 3 (option 3): census of document concepts, i.e. what the teaching documents name that no taught concept
 * stands for, by denotation, with related links only. Development and held-out sections of the three R3 packages.
 *   node scripts/r3-document-concepts.mjs LABEL  -> evaluation/r3/document-concepts-LABEL.json (counts); private list */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const label=process.argv[2];const OUT=`evaluation/r3/document-concepts-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const KT=await import(D+'knowledge_translation.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const qk=QK.loadQuantityKnowledge();const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const C={};const priv={};
for(const run of ['translate-dev2-cues2','translate-heldout-fix1-tuned']){const r=JSON.parse(readFileSync(join(PE,'runs',run+'.json'),'utf8'));
 for(const [cat,d] of Object.entries(r.detail)){const s=new Set();const pool=store.categoryItems246(cat).filter(i=>i.concept&&!s.has(i.concept.id)&&s.add(i.concept.id)).map(i=>({id:i.concept.id,kind:i.concept.kind,statement:i.statement,aliases:i.concept.aliases}));
  const dc=KT.documentConcepts(qk,d.statements,pool);const k=run.includes('dev')?'dev':'heldout';C[k]??={};const c=C[k];
  for(const x of dc){c['concepts']=(c['concepts']??0)+1;c['denotes_'+x.denotes]=(c['denotes_'+x.denotes]??0)+1;if(x.mentions.length>1)c['repeated']=(c['repeated']??0)+1;if(x.related.length)c['with_related_taught_concept']=(c['with_related_taught_concept']??0)+1;}
  (priv[k]??={})[cat]=dc.slice(0,200);}}
store.close();
writeFileSync(OUT,JSON.stringify({schema:'pee.r3.document-concepts.v1',label,generatedAt:new Date().toISOString(),note:'unaligned subjects and objects (type-gated alignment v1 unresolved), keyed by head words; related links are retrieval candidates, never identities',counts:C},null,1)+'\n');
mkdirSync(join(PE,'runs'),{recursive:true});writeFileSync(join(PE,'runs',`document-concepts-${label}.json`),JSON.stringify(priv,null,1)+'\n');console.log(JSON.stringify(C));
