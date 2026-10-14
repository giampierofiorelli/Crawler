"""Research-only schema.org Product candidate identification.

Purpose: broaden Phase 83's biased data-* fixture parser for independent tests.
Only product ID and manufacturer DECLARED technical attributes are extracted.
No source or product is approved, ranked or retired by this parser.
"""
from __future__ import annotations

import json
import re
from typing import Any
from bs4 import BeautifulSoup

MAX_HTML=1_000_000
MAX_JSONLD_SCRIPTS=30
MAX_NODES=250
MAX_DEPTH=10
MAX_FIELD=240


def _plain(value: Any) -> str|None:
    if isinstance(value,(int,float)) and not isinstance(value,bool):
        value=str(value)
    if not isinstance(value,str):return None
    value=' '.join(value.split())
    if not 0<len(value)<=MAX_FIELD or any(ord(c)<32 for c in value):return None
    return value


def _brand(value:Any)->str|None:
    if isinstance(value,dict): value=value.get('name')
    return _plain(value)


def _nodes(value:Any, depth:int=0):
    if depth>MAX_DEPTH:return
    if isinstance(value,list):
        for item in value[:MAX_NODES]:yield from _nodes(item,depth+1)
    elif isinstance(value,dict):
        yield value
        if '@graph' in value:yield from _nodes(value['@graph'],depth+1)
        if 'mainEntity' in value:yield from _nodes(value['mainEntity'],depth+1)
        # Do not recursively traverse offers/reviews, which may include different products.


def candidate_products(html:str)->list[dict[str,Any]]:
    """Extract candidate identifiers; reported specs are NOT independent test outcomes."""
    if not isinstance(html,str) or len(html.encode('utf-8'))>MAX_HTML:
        raise ValueError('html_size_exceeded')
    soup=BeautifulSoup(html,'html.parser')
    records=[]; seen=set(); total=0
    for script in soup.find_all('script',attrs={'type':re.compile('^application/ld\\+json$', re.I)})[:MAX_JSONLD_SCRIPTS]:
        try:obj=json.loads(script.string or script.get_text())
        except (ValueError,TypeError):continue
        for node in _nodes(obj):
            total+=1
            if total>MAX_NODES:return records
            types=node.get('@type',[])
            types=[types] if isinstance(types,str) else types if isinstance(types,list) else []
            if not any(t in ('Product','ProductModel') for t in types):continue
            name=_plain(node.get('name'))
            if not name:continue
            model=_plain(node.get('model'))
            sku=_plain(node.get('sku'))
            mpn=_plain(node.get('mpn'))
            gtin=next((_plain(node.get(k)) for k in ('gtin14','gtin13','gtin12','gtin8','gtin') if _plain(node.get(k))),None)
            brand=_brand(node.get('brand'))
            # No trusted unique identifier? Keep a weak discovery candidate, never merge it with another.
            key=(brand,name,model,sku,mpn,gtin)
            if key in seen:continue
            seen.add(key)
            properties=[]
            vals=node.get('additionalProperty',[])
            vals=vals if isinstance(vals,list) else [vals]
            for prop in vals[:50]:
                if not isinstance(prop,dict):continue
                pname=_plain(prop.get('name'))
                pvalue=_plain(prop.get('value'))
                punit=_plain(prop.get('unitText'))
                if pname and pvalue:
                    properties.append({'name':pname,'reported_value':pvalue,'reported_unit':punit,
                                       'evidence_kind':'manufacturer_or_publisher_declared_not_tested'})
            records.append({'name':name,'brand':brand,'model':model,'sku':sku,'mpn':mpn,'gtin':gtin,
               'technical_properties':properties,'identification_status':'candidate_unverified',
               'independent_performance_evidence':False,'manufacturing_retired':False,
               'retirement_status':'not_determined_by_product_markup',
               'competitive_ranking_eligible':False,
               'availability_ignored':True})
    return records
