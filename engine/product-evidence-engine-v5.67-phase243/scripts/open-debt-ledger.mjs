#!/usr/bin/env node
/** G1d (owner authorisation 2026-10-21, §5): ledger pinning each open-debt entry of docs/architecture/vertical-contract.json
 * (item, resolvedStatus, progress) by SHA-256, so that an unintended change (the G1b bulk overwrite) fails
 * tests/contract_status_ledger.test.ts. Updating is deliberate and per entry, with a reason.
 * Usage:
 *   node scripts/open-debt-ledger.mjs --init --by WHO --reason TEXT        (only when no ledger exists)
 *   node scripts/open-debt-ledger.mjs --update ID --by WHO --reason TEXT   (one entry; refuses an unchanged entry)
 *   node scripts/open-debt-ledger.mjs --check                              (lists entries whose text differs from the ledger) */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const CP=new URL('../docs/architecture/vertical-contract.json',import.meta.url).pathname,LP=new URL('../docs/architecture/open-debt-ledger.json',import.meta.url).pathname;
const C=JSON.parse(readFileSync(CP,'utf8'));const h=v=>v===undefined||v===null?null:createHash('sha256').update(String(v)).digest('hex');
const pin=d=>({item:h(d.item),resolvedStatus:h(d.resolvedStatus),progress:h(d.progress)});
const today=new Date().toISOString().slice(0,10);const by=arg('by'),reason=arg('reason');
const save=L=>writeFileSync(LP,JSON.stringify(L,null,1)+'\n');
if(process.argv.includes('--init')){if(existsSync(LP))throw Error('ledger exists: use --update ID');if(!by||!reason)throw Error('--by and --reason required');
 save({schema:'pee.open-debt-ledger.v1',purpose:'pins each open-debt entry of vertical-contract.json; change one entry at a time with a reason (tests/contract_status_ledger.test.ts)',
  entries:C.openDebt.map(d=>({id:d.id,...pin(d),history:[{date:today,by,reason}]}))});console.log('ledger created:',C.openDebt.length,'entries');process.exit(0);}
const L=JSON.parse(readFileSync(LP,'utf8'));const byId=new Map(L.entries.map(e=>[e.id,e]));
const changed=C.openDebt.filter(d=>{const e=byId.get(d.id);const p=pin(d);return !e||e.item!==p.item||e.resolvedStatus!==p.resolvedStatus||e.progress!==p.progress;}).map(d=>d.id);
if(process.argv.includes('--check')){console.log(changed.length?'changed: '+changed.join(', '):'all entries match the ledger');process.exit(changed.length?1:0);}
const id=arg('update');if(!id||!by||!reason)throw Error('usage: --update ID --by WHO --reason TEXT');
const d=C.openDebt.find(x=>x.id===id);if(!d)throw Error('no open-debt entry '+id);if(!changed.includes(id))throw Error(id+' is unchanged');
if(changed.length>1)process.stderr.write(`note: other changed entries remain unrecorded: ${changed.filter(x=>x!==id).join(', ')}\n`);
const e=byId.get(id)??{id,history:[]};Object.assign(e,pin(d));e.history.push({date:today,by,reason});if(!byId.has(id))L.entries.push(e);
save(L);console.log('ledger updated:',id);
