import {writeFileSync} from 'node:fs';
import {inspectStairEvidence118} from '../src/phase118_real_stair_capability_audit.js';
import {ORIGINAL_STAIR_CASE_118} from '../src/phase118_stair_reviewed_source_case.js';
const q=(capabilities:readonly ('single_threshold'|'two_part_threshold'|'multiple_stair_ascent'|'vacuum_stair_treads')[],requireRetail=false,requireExhibitionDemonstration=false)=>inspectStairEvidence118(ORIGINAL_STAIR_CASE_118,{verification:'externally_verified_semantic_intent',capabilities,requireRetail,requireExhibitionDemonstration});
const result={release:'v4.42-phase118',asOf:'2026-10-11',provenance:'public original-source manual audit; no automatic web crawler or live inventory search; no verified whole-market coverage',scenarios:{
 climb_multiple_stairs_demonstrated:q(['multiple_stair_ascent'],false,true),
 climb_and_vacuum_treads_demonstrated:q(['multiple_stair_ascent','vacuum_stair_treads'],false,true),
 stair_climbing_in_retail_verified:q(['multiple_stair_ascent'],true,true),
 threshold_crossing_available:q(['single_threshold'],true,false),
 two_part_threshold_available:q(['two_part_threshold'],true,false)
}};
writeFileSync('PHASE118-REAL-SOURCE-RESULTS.json',JSON.stringify(result,null,2)+'\n');
console.log('Created PHASE118-REAL-SOURCE-RESULTS.json; source fingerprint:',result.scenarios.climb_multiple_stairs_demonstrated.sourceFingerprint);
