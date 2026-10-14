import {readFileSync,writeFileSync} from 'node:fs';
import {inspectPilotBatch138} from '../dist/src/phase138_original_excerpt_pilot.js';
const rows=JSON.parse(readFileSync('research/phase138_original_review_pilot/PHASE138-ORIGINAL-EXCERPT-PILOT.json','utf8'));
const results=inspectPilotBatch138(rows);
const artifact={version:'4.62-phase138',date:'2026-10-11',source:'manually transcribed short verbatim extracts from three public original expert reviews',
 manuallyCheckedAgainstWebOnDate:'2026-10-11',fullOriginalDocumentsPreserved:false,
 originalFullPageSnapshotsAcquired:0,licensedFullPageSnapshots:0,
 independentlyAnnotatedCases:0,scientificAccuracyEstimate:null,
 noAutomaticCandidateDiscovery:true,noIndependentPublisherAuthenticityProof:true,
 developerSuppliedModelAliases:true,developerGoldIsNotIndependent:true,
 sourceQuoteTotalByPublisher:Object.fromEntries([...new Set(rows.map(x=>x.publisherGroupId))].map(k=>[k,rows.filter(r=>r.publisherGroupId===k).reduce((n,r)=>n+r.text.trim().split(/\s+/).length,0)])),
 ...results,notes:['These are genuine short passages but the pairing of subject/object and claim label was developer-supplied.',
 'The code did not crawl full pages; excerpt SHA-256 is NOT a publisher-signed page snapshot.',
 'This is a diagnostic pilot, not an independent recall, precision or accuracy benchmark.',
 'No rights to redistribute the full source reviews are asserted; only short attributed extracts kept.']};
writeFileSync('PHASE138-REAL-EXCERPT-DIAGNOSTIC.json',JSON.stringify(artifact,null,2)+'\n');
console.log(JSON.stringify({excerpts:results.excerptCount,sourceCount:results.sourceCount,byStatus:results.byStatus},null,2));
