import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {inspectReferenceSurfaceSafety152} from '../dist/src/phase152_product_surface_safety.js';
import {discoverEntityInventory153} from '../dist/src/phase153_entity_inventory.js';
const sha=t=>createHash('sha256').update(t).digest('hex');
const clause='LG C6 2026 was evaluated. Sony BRAVIA 9 II was compared. The screen was set to a standard mode.\n\n';
const rows=[];
for(const rep of [2,20,100]){
 const text=clause.repeat(rep),input={document:{text,sha256:sha(text),source:{id:`p153scale_${rep}`,originalDocumentId:`p153scale_${rep}`,url:'https://example.org/constructed/stress',title:'Constructed stress sample',role:'original_product_test'}}};
 // No pooling between measurements. Process/JIT, GC, thermal, and workload are
 // uncontrolled; values are diagnostics on this machine only.
 const before=process.memoryUsage().heapUsed;
 const b0=performance.now(),baseline=inspectReferenceSurfaceSafety152(input),b1=performance.now();
 const current=discoverEntityInventory153(input),b2=performance.now();
 rows.push({repeats:rep,sourceCharacters:text.length,phase152ElapsedMs:Math.round((b1-b0)*1000)/1000,
 phase153ElapsedMsIncludingPhase152:Math.round((b2-b1)*1000)/1000,
 heapDeltaBytes:process.memoryUsage().heapUsed-before,
 baselineTruncated:baseline.truncated,phase153Truncated:current.truncated,
 observedInventoryCount:current.mentions.length});
}
const result={phase:153,origin:'local_developer_constructed_single_pass_not_production_benchmark',
 platform:{node:process.version,architecture:process.arch,os:process.platform},
 warmups:0,repeatsPerSize:1,controlledCPU:false,isolatedGC:false,heapMeasurementsNotPeakRSS:true,
 rows,comparativeSpeedClaimAuthorized:false};
writeFileSync('PHASE153-COMPUTE-DIAGNOSTIC.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(rows,null,2));
