#!/usr/bin/env node
/** S78: records the R1+ blind source verification of measured_by relations (fresh-context verifiers checked each relation
 * against the owner package it cites; evaluation/r1/relation-verification.json, files sealed by hash) as sufficiency
 * assessments in the store. Same-model verification: recorded as such, never as independent review.
 *   node scripts/s78-import-sufficiency.mjs [--dry-run] [--store PATH]   (counts only on stdout) */
import {readFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const args=process.argv.slice(2);const dry=args.includes('--dry-run');
const storePath=args.includes('--store')?args[args.indexOf('--store')+1]:join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const D=new URL('../dist/src/',import.meta.url).href;const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const R=await import(D+'phase247_category_relations.js');
const seal=JSON.parse(readFileSync('evaluation/r1/relation-verification.json','utf8'));
const store=new KnowledgeStore246(storePath);const C={};const inc=k=>C[k]=(C[k]??0)+1;
for(const f of seal.files){const p=join(PE,'r1v/relations',f.file);if(!existsSync(p)){inc('file_missing');continue;}
 const b=readFileSync(p);if(createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error('verdict file changed: '+f.file);
 const v=JSON.parse(b.toString('utf8'));
 for(const x of v.verdicts){const rel=store.db.prepare('SELECT kind FROM category_relations WHERE relation_id=?').get(x.id);
  if(!rel){inc('relation_not_in_store');continue;}if(rel.kind!=='measured_by'){inc('not_measured_by');continue;}
  // a relation the source does not support is no evidence either way: unclear
  const value=x.support==='supported'||x.support==='partially_supported'?(x.sufficiency==='establishes'||x.sufficiency==='informs_only'?x.sufficiency:'unclear'):'unclear';
  inc('measured_by:'+value+(x.support==='partially_supported'?' (partially supported)':''));
  if(!dry)R.assessRelation247(store,{relationId:x.id,value,basis:'blind_source_verification',assessor:'r1v-blind-source-verifier',
   citation:String(x.citedLocation||'owner research package cited by the relation (location not recorded by the verifier)').slice(0,400).replace(/[<>\r\n]/g,' '),
   note:[x.support,x.scopeProblem].filter(Boolean).join('; ').slice(0,300).replace(/[<>\r\n]/g,' ')},seal.sealedAt+'T12:00:00.000Z');}}
store.close();console.log(dry?'DRY RUN':'recorded',JSON.stringify(C));
