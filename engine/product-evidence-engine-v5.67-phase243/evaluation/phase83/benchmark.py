"""Phase 83 — offline, local-only acquisition benchmark.

IMPORTANT: This evaluates acquisition and structure-preservation on CONSTRUCTED test pages.
It cannot demonstrate legal permission to crawl actual sites, LLM fidelity, market coverage,
or the actual comparative performance of an uninstalled competitor.
The fixture server binds only to 127.0.0.1; requests to other hosts are rejected.
"""
from __future__ import annotations
import argparse
import asyncio
import contextlib
import hashlib
import json
import os
from pathlib import Path
import statistics
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup
# Works both as `python -m evaluation.phase83.benchmark` and as direct script.
try:
    from evaluation.phase84.schema_product import candidate_products
except ModuleNotFoundError as exc:
    if exc.name != 'evaluation':
        raise
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from evaluation.phase84.schema_product import candidate_products

ROOT=Path(__file__).resolve().parent
SITE=ROOT/'fixtures'/'site'
GOLD=json.loads((ROOT/'gold.json').read_text())
PAGES=tuple(GOLD)
DYNAMIC={'catalogue.html'}


def extract_grounded_facts(page_html: str) -> set[str]:
    """Common deterministic extractor for both arms: isolates retrieval differences.

    This function is NOT a generalized production parser or semantic model.
    It relies on data-* attributes deliberately present in the synthetic fixture.
    """
    soup=BeautifulSoup(page_html,'html.parser')
    facts=set()
    for elem in soup.select('[data-entity="product"][data-model-id]'):
        mid=elem.get('data-model-id','').strip()
        if mid: facts.add(f'model:{mid}')
        if elem.get('data-manufacturing-state')=='discontinued':
            facts.add(f'manufacturing:{mid}:discontinued')
    for elem in soup.select('[data-model-ref][data-spec-key][data-spec-value]'):
        p,k,v=(elem.get(x,'').strip() for x in ('data-model-ref','data-spec-key','data-spec-value'))
        if p and k and v: facts.add(f'spec:{p}:{k}:{v}')
    for elem in soup.select('[data-model-ref][data-original-test][data-criterion][data-value][data-unit][data-method]'):
        vals=[elem.get(x,'').strip() for x in ('data-model-ref','data-original-test','data-criterion','data-value','data-unit','data-method')]
        if all(vals):facts.add('measure:'+':'.join(vals))
    for elem in soup.select('[data-variant-ref][data-variant-id]'):
        p,v=(elem.get(x,'').strip() for x in ('data-variant-ref','data-variant-id'))
        if p and v:facts.add(f'variant:{p}:{v}')
    # Additional realistic schema.org Product discovery route: declared specifications only.
    # This conversion is shared by both arms and is not a ranking judgement.
    for product in candidate_products(page_html):
        model=product['model']
        if not model:continue
        facts.add(f'model:{model}')
        for prop in product['technical_properties']:
            unit=f" {prop['reported_unit']}" if prop['reported_unit'] else ''
            facts.add(f"spec:{model}:{prop['name']}:{prop['reported_value']}{unit}")
    return facts


class FixtureHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        request_path=urlsplit(self.path).path
        page=request_path.lstrip('/')
        # No traversal, no proxying, no redirect to external hosts.
        if '/' in page or page not in [*PAGES,'robots.txt']:
            self.send_error(404);return
        raw=(SITE/page).read_bytes()
        etag='"'+hashlib.sha256(raw).hexdigest()+'"'
        if self.headers.get('If-None-Match')==etag:
            self.send_response(304);self.send_header('ETag',etag);self.end_headers()
            self.server.metrics.append((page,304,0))
            return
        self.send_response(200)
        self.send_header('Content-Type','text/plain; charset=utf-8' if page=='robots.txt' else 'text/html; charset=utf-8')
        self.send_header('Content-Length',str(len(raw)))
        self.send_header('ETag',etag)
        self.end_headers();self.wfile.write(raw)
        self.server.metrics.append((page,200,len(raw)))
    def log_message(self,*args):pass

@contextlib.contextmanager
def fixture_server():
    srv=ThreadingHTTPServer(('127.0.0.1',0),FixtureHandler)
    srv.metrics=[]
    t=threading.Thread(target=srv.serve_forever,daemon=True)
    t.start()
    try:yield srv,f'http://127.0.0.1:{srv.server_port}'
    finally:srv.shutdown();srv.server_close();t.join(timeout=2)


def local_fetch(url:str)->tuple[str,str]:
    parts=urlsplit(url)
    if parts.scheme!='http' or parts.hostname!='127.0.0.1' or not parts.port:
        raise ValueError('Benchmark permits fixture server on 127.0.0.1 only')
    with urlopen(Request(url,headers={'User-Agent':'ProductEvidenceBenchmark/83'}),timeout=5) as r:
        return r.read(1_000_000).decode('utf-8'),r.headers.get('ETag','')


def fetch_inhouse(url:str, page:str, chromepath:str|None)->str:
    if page not in DYNAMIC:
        return local_fetch(url)[0]
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        kwargs={'headless':True}
        if chromepath:kwargs['executable_path']=chromepath
        browser=p.chromium.launch(**kwargs)
        try:
            tab=browser.new_page(java_script_enabled=True)
            tab.goto(url,wait_until='domcontentloaded',timeout=8000)
            tab.locator('[data-model-id="mattress-a1"]').wait_for(timeout=5000)
            tab.locator('#more').click(timeout=5000)
            tab.locator('[data-model-id="mattress-a4"]').wait_for(timeout=5000)
            return tab.content()
        finally:browser.close()


async def crawl4ai_arm(base_url:str, chromium_path:str|None)->dict:
    try:
        from crawl4ai import AsyncWebCrawler,BrowserConfig,CrawlerRunConfig,CacheMode
    except (ModuleNotFoundError,ImportError) as exc:
        return {'state':'not_run','reason':f'crawl4ai_not_installed: {exc.__class__.__name__}','cases':[]}
    args={'headless':True}
    if chromium_path:args['browser_type']='chromium'  # use normal configured browser binary; no forced unsafe patch
    try:
        browser_config=BrowserConfig(**args)
        cases=[]
        async with AsyncWebCrawler(config=browser_config) as crawler:
            for page in PAGES:
                start=time.perf_counter();url=base_url+'/'+page
                # Same fixed URLs; no AI inference or outside links.
                try:
                    rcfg={'cache_mode':CacheMode.BYPASS}
                    if page in DYNAMIC:
                        rcfg['wait_for']='css:[data-model-id="mattress-a1"]'
                        rcfg['js_code']='document.querySelector("#more")?.click()'
                    result=await crawler.arun(url,config=CrawlerRunConfig(**rcfg))
                    if not result.success:raise RuntimeError(str(result.error_message)[:220])
                    # Original DOM HTML, not model-generated markdown, for fair same-parser evaluation.
                    html=result.html or ''
                    cases.append(make_case(page,extract_grounded_facts(html),time.perf_counter()-start,None))
                except Exception as exc:
                    cases.append(make_case(page,set(),time.perf_counter()-start,type(exc).__name__+': '+str(exc)[:220]))
        return {'state':'run','cases':cases,'browser':'framework_managed','uses_llm':False}
    except Exception as exc:
        return {'state':'failed_to_start','reason':type(exc).__name__+': '+str(exc)[:220],'cases':[]}


def make_case(page:str,found:set[str],elapsed:float,error:str|None):
    gold=set(GOLD[page]);tp=len(found&gold);fp=len(found-gold);fn=len(gold-found)
    return {'page':page,'mode':'dynamic_browser' if page in DYNAMIC else 'static_html',
       'status':'error' if error else 'ok','error':error,'expected':len(gold),'found':len(found),
       'true_positives':tp,'false_positives':fp,'false_negatives':fn,
       'precision':round(tp/(tp+fp),4) if tp+fp else None,
       'recall':round(tp/len(gold),4) if gold else None,
       'elapsed_ms':round(elapsed*1000,2)}


def summarize(cases:list[dict]):
    ok=[x for x in cases if x['status']=='ok']
    tp=sum(x['true_positives'] for x in ok)
    fp=sum(x['false_positives'] for x in ok)
    fn=sum(x['false_negatives'] for x in ok)
    untested=[x['page'] for x in cases if x['status']!='ok']
    # Failed/blocked cases are EXCLUDED from numeric recall rather than counted as omissions.
    return {'completed_cases':len(ok),'total_cases':len(cases),'untested_cases':untested,
      'evaluated_true_positives':tp,'evaluated_false_positives':fp,'evaluated_false_negatives':fn,
      'micro_precision_on_completed':round(tp/(tp+fp),4) if tp+fp else None,
      'micro_recall_on_completed':round(tp/(tp+fn),4) if tp+fn else None,
      'median_case_ms':round(statistics.median(x['elapsed_ms'] for x in ok),2) if ok else None}


def render_only_dynamic_fixture(chrome:str|None)->dict:
    """Tests DOM+JS via set_content; intentionally does not test HTTP navigation."""
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            kw={'headless':True}
            if chrome:kw['executable_path']=chrome
            b=p.chromium.launch(**kw)
            try:
                tab=b.new_page(java_script_enabled=True)
                tab.set_content((SITE/'catalogue.html').read_text(),wait_until='domcontentloaded')
                tab.locator('[data-model-id="mattress-a1"]').wait_for(timeout=3000)
                tab.locator('#more').click(timeout=3000)
                tab.locator('[data-model-id="mattress-a4"]').wait_for(timeout=3000)
                return {'state':'passed','facts':len(extract_grounded_facts(tab.content())),
                        'navigation_tested':False,'uses_fixture_html_in_memory':True}
            finally:b.close()
    except Exception as exc:
        return {'state':'blocked','reason':type(exc).__name__+': '+str(exc)[:200],
                'navigation_tested':False,'uses_fixture_html_in_memory':True}


def run(arm:str='both',chrome:str|None=None)->dict:
    with fixture_server() as (server,base):
        result={'scope':'LOCAL CONSTRUCTED HTML ONLY; no public sources; no LLM used',
          'arms':{},'render_only_diagnostic':render_only_dynamic_fixture(chrome),'limitations':['Evidence extraction uses fixture-specific data-* attributes, not free-text semantics',
          'Browser rendering requires accessible Chromium and may be blocked by the execution environment',
          'This is not a live web performance test, nor an independent framework comparison unless both arms run',
          'No market coverage, source licensing, or product recommendation accuracy is measured']}
        if arm in ('inhouse','both'):
            cases=[]
            for page in PAGES:
                start=time.perf_counter()
                try:
                    body=fetch_inhouse(base+'/'+page,page,chrome)
                    cases.append(make_case(page,extract_grounded_facts(body),time.perf_counter()-start,None))
                except Exception as exc:
                    cases.append(make_case(page,set(),time.perf_counter()-start,type(exc).__name__+': '+str(exc)[:220]))
            result['arms']['inhouse']={'state':'run','cases':cases,'summary':summarize(cases),
                'dependencies':'stdlib urllib + BeautifulSoup + optional Playwright, no commercial API or LLM'}
        if arm in ('crawl4ai','both'):
            item=asyncio.run(crawl4ai_arm(base,chrome))
            if item.get('state')=='run':item['summary']=summarize(item['cases'])
            result['arms']['crawl4ai']=item
        result['local_fixture_http_requests']=len(server.metrics)
        result['local_fixture_http_body_bytes']=sum(x[2] for x in server.metrics)
        result['comparison_valid']=all(result['arms'].get(k,{}).get('state')=='run' and not
          result['arms'][k]['summary']['untested_cases'] for k in ('inhouse','crawl4ai'))
        return result


def main():
    parser=argparse.ArgumentParser(description='Run offline acquisition A/B on local constructed pages')
    parser.add_argument('--arm',choices=['inhouse','crawl4ai','both'],default='both')
    parser.add_argument('--chromium',default=os.getenv('PHASE83_CHROMIUM_EXECUTABLE'))
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    result=run(args.arm,args.chromium)
    rendered=json.dumps(result,indent=2,ensure_ascii=False)
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(rendered+'\n')
    print(rendered)

if __name__=='__main__':main()
