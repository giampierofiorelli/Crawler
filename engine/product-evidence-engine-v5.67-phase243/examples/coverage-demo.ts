import {auditCoverage} from '../src/coverage_pilot.js';
// Fictional sample only; no vendor rights have been granted.
const variants=Array.from({length:30},(_,i)=>({variantId:`SYNTHETIC-UK-${i+1}`,market:'GB',category:'synthetic',identityReviewed:true}));
const offers=[{provider:'amazon' as const,variantId:'SYNTHETIC-UK-1',merchantId:'amazon-synthetic',exactVariantVerified:true,totalPriceVerified:true,inStock:true,observedAt:'2026-10-10T12:00:00Z',condition:'new' as const}];
const result=auditCoverage({market:'GB',asOf:'2026-10-10T12:00:00Z',maxAgeHours:24,variants,offers,grants:[]});
console.log(JSON.stringify({demo:'SYNTHETIC DATA ONLY',...result},null,2));
