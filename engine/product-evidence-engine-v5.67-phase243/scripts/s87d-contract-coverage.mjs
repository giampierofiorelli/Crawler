#!/usr/bin/env node
/** S87d: map every row of the existing observation tables into the v0.2 observation contract (read-only) and measure, per
 * table and field, what is stated, inferred or unknown, plus shape violations. Also measures whether the private
 * qualitative gold (Phase269-272, Step 1D-B) is representable by qualitative_observations270 versus the contract.
 *   node scripts/s87d-contract-coverage.mjs --store STORE.sqlite [--qual-gold-dir DIR] [--out PUBLIC]
 * Opens the store read-only (node:sqlite readOnly); writes nothing to it. Public output: counts only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {DatabaseSync} from 'node:sqlite';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const C=await import(new URL('../dist/src/observation_contract.js',import.meta.url).href);
const db=new DatabaseSync(arg('store'),{readOnly:true});
const url=db.prepare('SELECT url FROM revisions WHERE revision_id=?');const u=id=>url.get(id)?.url??null;
const tables={test_measurements265:C.fromTestMeasurement265,qualitative_observations270:C.fromQualitative270,comparative_results271:C.fromComparative271,declarations:C.fromDeclaration};
const out={schema:'pee.s87d.contract-coverage.v2',contract:C.OBSERVATION_CONTRACT_VERSION,store:'read-only',
 note:'v2 (S87e): structural validity and scientific completeness per purpose are separate; comparison sets are counted as records of their own',tables:{}};
const account=(name,records)=>{const slots={},viol={},purposes={};let valid=0;
 for(const o of records){for(const [k,s] of Object.entries(C.slotStates(o)))(slots[k]??={stated:0,inferred:0,unknown:0})[s]++;
  const v=C.checkStructure(o);if(v.valid)valid++;for(const x of v.violations)viol[x.shape]=(viol[x.shape]??0)+1;
  for(const [p,st] of Object.entries(C.assessCompleteness(o))){const b=purposes[p]??={complete:0,complete_with_inferences:0,incomplete:0,missing:{}};b[st.status]++;for(const m of st.missing)b.missing[m]=(b.missing[m]??0)+1;}}
 out.tables[name]={records:records.length,structurallyValid:valid,violations:viol,completeness:purposes,slots};};
for(const [t,f] of Object.entries(tables)){const rows=db.prepare(`SELECT * FROM ${t} WHERE state NOT LIKE 'superseded%'`).all();
 account(t,rows.map(r=>f(r,u(r.revision_id))));
 if(t==='comparative_results271')account('comparative_results271:comparison_sets',C.comparisonsFromComparative271(rows,u));}
// qualitative gold: can the existing table hold it? (its CHECKs admit 5 cooking outcomes, a dish, a cooking-test basis)
const QOUT=new Set(['crispness','browning','evenness','doneness','moisture']);
const gd=arg('qual-gold-dir');if(gd){const J=f=>JSON.parse(readFileSync(join(gd,f),'utf8'));const items=[];
 const CAT={af:'air_fryers',ap:'air_purifiers',dw:'dishwashers',tv:'televisions',td:'tumble_dryers',dh:'dehumidifiers'};
 for(const f of ['phase272/gold-untouched.json','phase272/gold-tumble_dryers.json','phase272/gold-dev.json','step1d-b/gold.json'])for(const q of J(f).qualitative??[])items.push({cat:CAT[String(q.doc).split('_')[1]]??(f.includes('tumble')?'tumble_dryers':'unknown'),outcome:q.dimension,dish:null});
 for(const q of J('phase271/untouched-extraction-gold.json').qualitative??[])items.push({cat:'air_fryers',outcome:q.outcome,dish:q.dish});
 for(const d of J('phase269/qualitative-gold.json').documents??J('phase269/qualitative-gold.json').docs??[])for(const q of d.obs??[])items.push({cat:'air_fryers',outcome:q.outcome,dish:q.dish});
 const by={};for(const it of items){const ok270=QOUT.has(it.outcome)&&!!it.dish;const b=by[it.cat]??={items:0,representable270:0,representableContract:0};b.items++;if(ok270)b.representable270++;b.representableContract++;}
 out.qualitativeGold={note:'representable270: admitted by the CHECK constraints of qualitative_observations270 (5 cooking outcomes, a dish). The contract admits any property with a judgement.',byCategory:by,
  total:{items:items.length,representable270:items.filter(i=>QOUT.has(i.outcome)&&i.dish).length,representableContract:items.length}};}
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out,null,1));
