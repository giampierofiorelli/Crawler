/** Build a standalone RESEARCH-ONLY distribution containing ONLY the verified launch graph. */
import { cp, mkdir, rm, writeFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const out = 'release-launch';
execFileSync(process.execPath, ['scripts/build-launch.mjs'], {stdio:'inherit'});
await rm(out, {recursive:true,force:true});
await mkdir(out, {recursive:true});
await cp('dist-launch', out, {recursive:true,force:true});
const manifest = {
  name:'product-evidence-engine-launch', version:'3.1.0', private:true, type:'module',
  description:'Research-only synthetic demonstration with documentary evidence-approval gate; not production scoring.',
  main:'./launch/index.js',
  types:'./launch/index.d.ts',
  exports:{'.':{'types':'./launch/index.d.ts','default':'./launch/index.js'}},
};
await writeFile(path.join(out,'package.json'), JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(out,'README.md'), '# Price-free isolated research package (Phase 63)\n\nThis research artifact includes price-free synthetic ranking, documented source-review checks, and an approved-link resolver. Callers MUST supply `purpose: synthetic_demo` and documentary approvals. Public deployment is BLOCKED until real measurement normalization and source rights are independently validated. It is not a deployed web application. No Amazon API data or MSRP/RRP is used. Inputs and rights approvals in demos are synthetic.\n\nImport `buildLaunchRecommendation` from this package; do not load any historical research source files. Retailer prices and affordability are not evaluated. Verify current price directly at the retailer.\n\nPhase 63 original-test lineage and earlier experimental contextual functional suitability modules are deliberately NOT included. This package remains an older synthetic demo pipeline, not a validated consumer recommendation engine. Not a legal-compliance certification; no merchant contracts or real retailer destinations have been independently approved.\n');
const names = (await readdir(out)).sort();
if (names.includes('src') || names.includes('dist') || names.includes('tests') || names.includes('ingestion')) {
  throw new Error('Unexpected research/source code in standalone release');
}
console.log(`Standalone price-free release prepared in ${out}/`);
