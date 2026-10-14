/** Explicitly synthetic: never import this data into a commercial recommendation flow. */
import { readFileSync } from 'node:fs';
import { rankSnapshot } from '../dist/src/db_adapter.js';
const snapshot=JSON.parse(readFileSync('fixtures/bridge-synthetic.json','utf8'));
// Refresh the offer timestamp ONLY for this explicitly synthetic demo.
for (const v of snapshot.variants) v.observed_at = new Date().toISOString();
const report=rankSnapshot(snapshot,{market:'UK',currency:'GBP',weights:{carpet:15,pet_hair:70,ease:15}},'synthetic_fixture');
console.log(JSON.stringify(report,null,2));
