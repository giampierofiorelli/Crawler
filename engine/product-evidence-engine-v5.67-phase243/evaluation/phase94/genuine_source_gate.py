"""Phase94 source-rights preflight + replay of pre-existing genuine evidence.

Fails closed on access: NOTHING in this program fetches the internet, mimics a
website, makes an LLM request, or writes consumer ranking evidence.

The source manifests are auditable human-created observations about public
rights/terms at the assessment date; they are NOT a legal clearance service.
"""
from __future__ import annotations
import json, socket, sys
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCES = [
    dict(id='raspberry_pi_documentation', kind='manufacturer_html',
         url='https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html',
         licence_url='https://www.raspberrypi.com/licensing/',
         terms_url='https://www.raspberrypi.com/terms-and-conditions/',
         robots_url='https://www.raspberrypi.com/robots.txt',
         rights='source_text_cc_by_sa_4_not_website_scrape_permission',
         terms='explicit_anti_scraping_clause_5_8',
         automated_acquisition='denied_pending_permission_or_applicable_exception',
         explanation='2026-06-02 site terms clause 5.8 expressly reserves scraping/TDM rights.'),
    dict(id='arduino_product_docs', kind='manufacturer_html',
         url='https://docs.arduino.cc/hardware/uno-r4-wifi/',
         licence_url=None,
         terms_url='https://www.arduino.cc/en/terms-conditions',
         robots_url='https://docs.arduino.cc/robots.txt',
         rights='site_content_reuse_not_independently_cleared',
         terms='review_not_completed_for_commercial_automated_reuse',
         automated_acquisition='denied_until_reviewed',
         explanation='Actual documentation publicly viewable; commercial machine ingestion not authorized by fact of public accessibility.'),
    dict(id='blender_open_data', kind='original_benchmark',
         url='https://opendata.blender.org/benchmarks/query/?blender_version=4.4.0&compute_type=OPTIX&group_by=device_name',
         licence_url='https://opendata.blender.org/download/',
         terms_url=None, robots_url='https://opendata.blender.org/robots.txt',
         rights='cc0_for_published_raw_archive_as_documented',
         terms='automatic_web_download_not_separately_audited',
         automated_acquisition='not_executed_network_blocked',
         explanation='Offline fixture contains prior manually transcribed public-page values, NOT a downloaded official CSV.'),
    dict(id='sbaf_headphone_database', kind='original_lab_excerpt',
         url='https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/cEAR30-Sennheiser-HD600-L.txt',
         licence_url='https://creativecommons.org/licenses/by/4.0/legalcode.en',
         terms_url='https://docs.github.com/en/site-policy/github-terms/github-terms-of-service',
         robots_url='https://github.com/robots.txt',
         rights='author_declared_cc_by_4_data',
         terms='fresh_automated_website_intake_not_reviewed',
         automated_acquisition='not_executed_network_blocked',
         explanation='Offline source excerpt predates this evaluation, 20 of an original longer measurement series.'),
]

def can_authorize_automatic_acquisition(source: dict[str, Any]) -> bool:
    """Intentionally conservative gate, independent of content licence or robots permissiveness."""
    # No source in this preflight has authenticated website rights for the planned
    # commercial machine acquisition. Supplying a CC licence alone cannot set this.
    return (source.get('automated_acquisition') == 'reviewed_authorized'
            and source.get('authenticated_rights_receipt') is not None
            and source.get('robots_receipt') is not None
            and source.get('terms_receipt') is not None)

def probe_dns(host: str) -> dict[str, str | bool]:
    try:
        socket.getaddrinfo(host,443,type=socket.SOCK_STREAM)
    except OSError as error:
        return {'host': host, 'available': False, 'reason': type(error).__name__}
    return {'host': host, 'available': True, 'reason': 'dns_resolution_succeeded_not_http_permission'}

def build_report(*, network_probe=True) -> dict:
    from evaluation.phase84.replay import SAMPLE_MANIFEST, assess_measurement_excerpt
    from primary_sources.blender_ingest import parse_csv
    phase84_manifest=json.loads(SAMPLE_MANIFEST.read_text(encoding='utf-8'))
    sbaf=assess_measurement_excerpt(phase84_manifest)
    bp=PROJECT_ROOT/'fixtures/primary_blender'
    blender=parse_csv((bp/'observations.csv').read_bytes(),json.loads((bp/'manifest.json').read_text()))
    dns = [probe_dns(host) for host in ('opendata.blender.org','github.com','www.raspberrypi.com','docs.arduino.cc')] if network_probe else []
    source_rows=[]
    for source in SOURCES:
        row=dict(source)
        row['automatic_acquisition_eligible']=can_authorize_automatic_acquisition(source)
        row['live_html_or_csv_acquired']=False
        row['site_contents_replayed_as_live']=False
        source_rows.append(row)
    return dict(schema='phase94_genuine_source_evidence_v1',
        status='REAL_SOURCE_PREFLIGHT_AND_PREEXISTING_AUTHENTIC_REPLAY_ONLY',
        project_basis='v4.18_phase93_original_repository',
        live_pages_fetched=0,live_html_bytes_fetched=0,
        live_extraction_precision=None,live_extraction_recall=None,
        third_party_web_text_mode='manual_source_verification_only_not_source_html',
        public_source_count=len(source_rows),sources=source_rows,dns=dns,
        existing_original_evidence=dict(
          sbaf=dict(source_id=phase84_manifest['source_id'],sha256=sbaf['provenance']['sha256'],
             original_lab_points_replayed=sbaf['measured_points'],reference_points_matched=sbaf['true_positives'],
             mismatches=sbaf['false_positives']+sbaf['false_negatives'],
             independent_gold_standard=False,live_fetch=False,ranking_allowed=False),
          blender=dict(device_count=blender['device_count'],input_sha256=blender['input_sha256'],
             acquisition_method=blender['acquisition_method'],original_csv_export_downloaded=False,
             benchmark_version=blender['benchmark_version'],backend=blender['compute_backend'],
             ranking_allowed=blender['ranking_input_approved'],
             products=[x['device_label'] for x in blender['devices']])) ,
        reasons=['No direct external DNS/HTTPS in execution environment (when probes fail)',
                 'Raspberry Pi site terms expressly reserve automated scraping/TDM rights',
                 'Arduino site-specific automated commercial reuse and robots not cleared',
                 'No independently acquired fresh native HTML or current benchmark CSV bytes'],
        next_valid_test='Acquire original source bytes via explicitly authorized transport and independently label held-out models before measuring extraction quality.')

if __name__=='__main__':
    report=build_report()
    data=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    if len(sys.argv)>1: Path(sys.argv[1]).write_text(data,encoding='utf-8')
    print(data)
