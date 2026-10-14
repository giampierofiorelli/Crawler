/** Live PostgreSQL -> read-only Python exporter -> TypeScript ranking.
 * No input JSON accepted in production mode; evidence must come from the DB view.
 */
import { spawnSync } from 'node:child_process';
import { rankSnapshot } from '../dist/src/db_adapter.js';
const weights = {carpet:15,pet_hair:70,ease:15};
const request={market:'UK',currency:'GBP',weights};
const proc=spawnSync(process.env.PYTHON_BIN??'python3',['-m','ingestion.export_approved'],{encoding:'utf8',maxBuffer:16*1024*1024});
if (proc.error || proc.status!==0) {
  process.stderr.write(proc.stderr || String(proc.error) || 'DB export failed');
  process.exit(1);
}
try {
  const report=rankSnapshot(JSON.parse(proc.stdout),request,'production');
  console.log(JSON.stringify(report,null,2));
  if (report.acceptedEvidence===0) console.error('SAFE NO-RECOMMENDATION: no validated real-world normalization profile; production scores withheld.');
} catch(err) { console.error('Bridge rejected DB snapshot:',err.message); process.exit(1); }
