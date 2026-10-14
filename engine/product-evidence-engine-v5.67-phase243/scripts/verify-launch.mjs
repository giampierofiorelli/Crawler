/** Verify compiled launch artifacts, not just the TypeScript export surface. */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'dist-launch');
const allowed = new Set([
  'launch/index.js','launch/index.d.ts',
  'launch_pipeline.js','launch_pipeline.d.ts',
  'launch_purchase.js','launch_purchase.d.ts',
  'purchase_links.js','purchase_links.d.ts',
  'launch_rank.js','launch_rank.d.ts',
  'evidence_review.js','evidence_review.d.ts',
  'types.js','types.d.ts',
]);
const forbidden = /(?:price_observations|purchase_decision|provider_feeds|commercial_rights|coverage_pilot|db_adapter|tradeoffs|list_price_context|engine\.js|manufacturer_editorial_gate|amazon-api|paapi)/i;
async function list(directory, prefix='') {
  const out=[];
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    const rel = path.posix.join(prefix,entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink in launch artifact: ${rel}`);
    if (entry.isDirectory()) out.push(...await list(path.join(directory,entry.name),rel));
    else if (entry.isFile()) out.push(rel);
    else throw new Error(`Unexpected artifact: ${rel}`);
  }
  return out;
}
const files = await list(dir);
if (files.length === 0) throw new Error('Empty launch artifact');
for (const f of files) {
  if (!allowed.has(f)) throw new Error(`Disallowed launch file: ${f}`);
  if (forbidden.test(f)) throw new Error(`Forbidden launch module: ${f}`);
  const content = await readFile(path.join(dir,f),'utf8');
  if (forbidden.test(content)) throw new Error(`Forbidden reference in launch file: ${f}`);
}
for (const f of allowed) if (!files.includes(f)) throw new Error(`Missing expected launch file: ${f}`);
// Import graph is fixed by compiler-generated ESM and covered by file allowlist.
const entry = await import(path.join(dir,'launch/index.js'));
if (Object.keys(entry).join(',') !== 'buildLaunchRecommendation') throw new Error('Unexpected runtime export surface');
console.log(`Launch artifact verified: ${files.length} allowlisted files; only buildLaunchRecommendation runtime export.`);
