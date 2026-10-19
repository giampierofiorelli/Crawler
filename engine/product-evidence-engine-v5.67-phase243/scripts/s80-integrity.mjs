#!/usr/bin/env node
/** S80 C1: print the system-integrity record of this container (store, compiled code, active rules, snapshot lineage).
 * Read-only. Exit 1 when a blocking finding is present (a run here would not be the system it claims to be).
 * Usage: node scripts/s80-integrity.mjs [--store FILE]   (default: the live store in $PEE_KNOWLEDGE_DIR) */
import {join} from 'node:path';import {homedir} from 'node:os';import {execFileSync} from 'node:child_process';
import {systemIntegrity80,BLOCKING_FINDINGS80} from '../dist/src/system_integrity80.js';
const i=process.argv.indexOf('--store');
const store=i>0?process.argv[i+1]:join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'pee246.sqlite');
let status=null;
try{status=JSON.parse(execFileSync(process.execPath,['--no-warnings','scripts/knowledge-snapshot.mjs','status'],{encoding:'utf8'}).trim().split('\n').pop());}catch{}
const r=systemIntegrity80(store,{snapshotStatus:status});
console.log(JSON.stringify(r,null,1));
if(r.findings.some(f=>BLOCKING_FINDINGS80.has(f)))process.exit(1);
