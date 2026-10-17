#!/usr/bin/env node
/** Pre-publication check (principle 9): what commits ADD to the public repository is checked against the private
 * store's retained declarations (src/publication_guard.ts). Fails closed when the private store is unavailable.
 *  node scripts/pee-publication-check.mjs                 commits not yet on any origin branch (what a push would publish)
 *  node scripts/pee-publication-check.mjs --range A..B    a commit range
 *  node scripts/pee-publication-check.mjs --history       every commit reachable from any ref (audit)
 *  node scripts/pee-publication-check.mjs --tree          the whole tree at HEAD (what is readable today)
 *  [--store FILE]  default: the verified private snapshot, else the live store
 * Exit 0 clean, 1 findings, 2 cannot check. The report never contains the values or lines it found.
 */
import {existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {execFileSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {buildPublicationIndex,scanAddedLines,addedLinesFromDiff,privateArtifactFindings} from '../dist/src/publication_guard.js';
const A=process.argv.slice(2);const arg=n=>A.includes(n)?A[A.indexOf(n)+1]:null;
const candidates=[arg('--store'),'/home/user/pee-knowledge/snapshot/pee246.sqlite',
 join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'pee246.sqlite')].filter(Boolean);
const store=candidates.find(f=>existsSync(f));
if(!store){console.error('pee-publication-check: no private store available; cannot verify publication safety (fail closed)');process.exit(2);}
const db=new DatabaseSync(store,{readOnly:true});
const rows=db.prepare(`SELECT d.product_id AS productId,p.name AS productName,d.raw_value AS rawValue FROM declarations d JOIN products p USING(product_id)
 WHERE p.name IS NOT NULL AND d.retention IN ('facts_retained','facts_retained_class_policy','local_pending_rights_review')`).all();
// Phase268: retained test measurements bound to a product are private values too.
const hasTm=db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='test_measurements265'").get();
if(hasTm)rows.push(...db.prepare(`SELECT t.product_id AS productId,p.name AS productName,(t.value||' '||t.unit) AS rawValue FROM test_measurements265 t JOIN products p USING(product_id)
 WHERE p.name IS NOT NULL AND t.value IS NOT NULL AND t.retention IN ('facts_retained','facts_retained_class_policy','local_pending_rights_review')`).all());
db.close();
const idx=buildPublicationIndex(rows);
const git=a=>execFileSync('git',a,{encoding:'utf8',maxBuffer:1<<30});
const rev=A.includes('--history')?['--all']:arg('--range')?[arg('--range')]:['HEAD','--not','--remotes=origin'];
// --tree: everything currently published at HEAD, as if added at once (what anyone can read today).
const diff=A.includes('--tree')?'commit '+git(['rev-parse','HEAD']).trim()+'\n'+git(['diff','--unified=0','--no-color','--no-renames',git(['hash-object','-t','tree','/dev/null']).trim(),'HEAD'])
 :git(['log','-p','--unified=0','--no-color','--no-renames','--format=commit %H',...rev]);
const {lines,files}=addedLinesFromDiff(diff);
const raw=[...privateArtifactFindings(files),...scanAddedLines(lines,idx)];
// Phase270: reviewed false positives, acknowledged one by one (commit, file, line, value digest, reason) in
// docs/architecture/publication-acknowledgements.json. An acknowledgement never covers another line, commit or value,
// and never a private store artefact.
const ackFile=new URL('../docs/architecture/publication-acknowledgements.json',import.meta.url);
const acks=existsSync(ackFile)?JSON.parse((await import('node:fs')).readFileSync(ackFile,'utf8')).acknowledged??[]:[];
const acked=f=>f.rule==='product_bound_declared_value'&&acks.some(a=>a.commit===f.commit&&a.file===f.file&&a.line===f.line&&a.valueDigest===f.valueDigest&&typeof a.reason==='string'&&a.reason.length>20);
const findings=raw.filter(f=>!acked(f));const acknowledged=raw.length-findings.length;
const commits=new Set(lines.map(l=>l.commit)).size;
console.log(JSON.stringify({store:store.includes('pee-knowledge')?'private snapshot':'live store',retainedDeclarations:rows.length,commitsScanned:commits,addedLines:lines.length,
 findings:findings.length,acknowledged,byCommit:Object.fromEntries([...new Set(findings.map(f=>f.commit))].map(c=>[c,findings.filter(f=>f.commit===c).length])),
 detail:findings},null,1));
process.exit(findings.length?1:0);
