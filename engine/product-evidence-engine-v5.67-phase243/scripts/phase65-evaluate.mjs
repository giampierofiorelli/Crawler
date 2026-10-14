import fs from 'node:fs';
import { auditPrimaryReviewReferences } from '../dist/src/empirical_reference_audit.js';
const data=JSON.parse(fs.readFileSync(new URL('../research/phase65-public-source-case-study.json',import.meta.url)));
const audit=auditPrimaryReviewReferences({observations:data.observations,questions:data.questions});
process.stdout.write(JSON.stringify({researchDataNotice:data.description,generatedAt:'not_recorded',audit},null,2)+'\n');
