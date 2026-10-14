/** Reproducible original-user-PDF validation, no original document retention. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const argv=process.argv.slice(2),args={};
for(let i=0;i<argv.length;i+=2)args[argv[i]?.replace(/^--/,'')]=argv[i+1];
const ids=['purifier','washdry','dreame','cx50','azurion'];
if(ids.some(k=>!args[k])){process.stderr.write('Provide --purifier, --washdry, --dreame, --cx50, --azurion PDFs.\n');process.exit(2);}
const anchors=[['WD04','net weight',4.25,'kg'],['WD05','net weight',4.52,'kg'],
 ['WD06','net weight',8.38,'kg'],['WD04','packaged weight',6.06,'kg'],
 ['WD05','packaged weight',6.64,'kg'],['WD06','packaged weight',12.41,'kg']];
const report={schema:'pee232.original-pdf-scope-evaluation.1',date:'2026-10-13',
 basis:'five user-supplied exact original manufacturer documents',
 inSampleDevelopmentNotHeldOut:true,manufacturerDeclarationsOnly:true,
 noOriginalDocumentsPackaged:true,independentEvidenceVerified:false,rankingAuthorized:false,
 documents:[],manuallyCheckedVariantAnchors:{expected:anchors.length,matched:0,missing:[]},
 comparisonToPhase231:{purifier:10,washdry:0,dreame:2,cx50:22,azurion:1}};
for(const id of ids){
 const bytes=readFileSync(args[id]);
 const parsed=await parseDocumentBytes228(bytes,'pdf');
 const sha256=createHash('sha256').update(bytes).digest('hex');
 if(parsed.documentSha256!==sha256||parsed.rawDocumentStored||parsed.rawTextStored||parsed.rankingAuthorized||parsed.scientificEvidenceAdmitted)throw Error('Receipt invariant failed: '+id);
 if(parsed.claims.some(c=>c.rankingAuthorized||c.exactVariantVerified||c.testedPerformance))throw Error('Unsafe promotion: '+id);
 const variants=parsed.claims.filter(c=>c.variantModel);
 if(variants.some(c=>c.model!==null||c.modelAssignment!=='unresolved'||c.variantType!=='document_declared_product_variant'))throw Error('Unsafe variant binding: '+id);
 report.documents.push({id,sha256,pagesInspectedAtMost:24,claims:parsed.claimCount,
  componentScopedCount:parsed.claims.filter(c=>c.componentModel).length,
  variantScopedCount:variants.length,
  reasonCodes:parsed.reasonCodes});
 if(id==='washdry'){
  const got=new Set(variants.map(c=>[c.variantModel,c.label,c.value,c.unit].join('|')));
  report.manuallyCheckedVariantAnchors.missing=anchors.filter(x=>!got.has(x.join('|')));
  report.manuallyCheckedVariantAnchors.matched=anchors.length-report.manuallyCheckedVariantAnchors.missing.length;
  if(report.manuallyCheckedVariantAnchors.missing.length||variants.length!==6)throw Error('Original authored variant anchors missing or spurious');
 }
 if(id==='cx50'&&parsed.claims.filter(c=>c.componentModel).length!==22)throw Error('CX50 scoped component baseline regression');
 if(id==='azurion'&&!parsed.claims.some(c=>c.unit==='cm/s'&&c.value===6))throw Error('Compound speed unit baseline regression');
}
process.stdout.write(JSON.stringify(report,null,2)+'\n');
