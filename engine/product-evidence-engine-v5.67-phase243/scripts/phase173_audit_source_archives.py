"""Read-only reproducible inventory of user-provided upstream ZIPs.
No execution/import/extraction of third-party code; names and hashes only.
Usage: python scripts/phase173_audit_source_archives.py /mnt/data > evaluation/phase173/upstream_archive_inventory.json
"""
import json,sys,hashlib,zipfile,pathlib
ROOT=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/mnt/data')
ARCHIVES={
 'DeepKE':'DeepKE-main(3).zip','extruct':'extruct-master(1).zip',
 'OAMine':'OAMine-main(1).zip','WDC-PAVE':'wdc-pave-main(1).zip',
 'WDC Products':'wdcproducts-main(2).zip','GLiNER2':'GLiNER2-main(3).zip',
 'MAVE':'MAVE-main(1).zip','Snorkel':'snorkel-main(3).zip',
 'medSpaCy':'medspacy-master(3).zip','VADER':'vaderSentiment-master(1).zip'
}
NOTES={
 'DeepKE':('MIT','Study document graph/entity relation extraction; existing Phase156 prototype, no model installation'),
 'extruct':('BSD-style license in original LICENSE','Compare JSON-LD/microdata/RDFa extraction patterns to existing crawlers, not a need parser'),
 'OAMine':('Apache-2.0 code; separately licensed data','Study open-world attribute candidates and clustering; do not transfer learned product facts to users'),
 'WDC-PAVE':('Root license not found in supplied ZIP; inspect individual data/code rights','Study attribute extraction vs normalization; cannot treat prompt/data material as unrestricted'),
 'WDC Products':('BSD-style conditions in supplied LICENSE; nested subprojects vary','Study product variant/entity matching; not household user intent'),
 'GLiNER2':('Apache-2.0 repository; checkpoint terms must be checked separately','Schema ideas / relation and span architecture only; weights and dependency integration deferred'),
 'MAVE':('CC BY-NC 4.0 LICENSE in supplied archive','Research-only data; noncommercial restriction prevents assumed commercial integration'),
 'Snorkel':('Apache-2.0','Study labeling-function diagnostics and disagreements; no unverified weak label as truth'),
 'medSpaCy':('MIT','Study context scope/negation/termination; clinical rules cannot be reused without retesting in shopping'),
 'VADER':('MIT','Sentiment is not product fit or user intent; currently low integration priority')
}
rows=[]
for key,filename in ARCHIVES.items():
 path=ROOT/filename
 if not path.is_file():raise SystemExit('Missing user archive: '+str(path))
 with zipfile.ZipFile(path) as z:
  infos=z.infolist()
  license_candidates=[i.filename for i in infos if pathlib.PurePosixPath(i.filename).name.lower() in ('license','license.md','license.txt','copying')]
  project_lic=[p for p in license_candidates if p.count('/')<=1]
  zip_slip_entries=[i.filename for i in infos if i.filename.startswith('/') or '..' in pathlib.PurePosixPath(i.filename).parts]
  detected,decision=NOTES[key]
  rows.append({'name':key,'archiveFilename':filename,'sha256':hashlib.file_digest(open(path,'rb'),'sha256').hexdigest(),
  'zipEntryCount':len(infos),'uncompressedBytes':sum(i.file_size for i in infos),
  'topLevelLicenseFiles':project_lic,'nestedLicenseFileCount':len(license_candidates)-len(project_lic),
  'licenseReading':detected,'researchDisposition':decision,'zipSlipEntries':zip_slip_entries,
  'importedInPhase173':False,'modelWeightsInstalled':False})
print(json.dumps({'phase':173,'status':'read_only_user_supplied_source_archive_inventory',
 'doesNotVerify':'licenses of embedded datasets, checkpoint weights, provenance of GitHub commit, fitness for production',
 'archiveCount':len(rows),'records':rows},indent=2,ensure_ascii=False))
