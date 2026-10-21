/** G1c shared script helper: the taught-category documents (same map as scripts/g1b-dev.mjs TAUGHT_DOCS). */
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';import {join,relative} from 'node:path';
export const TAUGHT_DOCS={air_fryers:['air-fryers'],coffee_machines:['PEE-COFFEE-COMPLETE-CUMULATIVE-KNOWLEDGE-PACKAGE.md'],dehumidifiers:['PEE-DEHUMIDIFIERS-CONSOLIDATED-RESEARCH-2026-10-15.md','PEE-CATEGORY-RESEARCH-02-DEHUMIDIFIERS-ORIGINAL.md'],
 dishwashers:['PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS','PEE-CATEGORY-RESEARCH-06-COUNTERTOP-DISHWASHERS'],air_purifiers:['PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS'],televisions:['PEE-CATEGORY-RESEARCH-07-TELEVISIONS']};
const walk=p=>statSync(p).isDirectory()?readdirSync(p).flatMap(n=>walk(join(p,n))):[p];
export function TAUGHT_DOCS_LOADER(dir){const docs=[];for(const [c,parts] of Object.entries(TAUGHT_DOCS))for(const part of parts){const b=join(dir,part);if(!existsSync(b))continue;
 for(const f of walk(b))if(f.endsWith('.md')||f.endsWith('CONSUMER-NEEDS-STRUCTURED.json'))docs.push({path:relative(dir,f),category:c,text:readFileSync(f,'utf8')});}return docs;}
