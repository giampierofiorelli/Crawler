"""Bounded transient HTML-to-review finding reader, not a URL fetcher.

No source text is returned. The receiving TypeScript code rechecks exact anchors
against bytes admitted through Phase69 and stores only hashes. Conservative:
one exact single-model article; measured battery hours (ANC context) only.
Other measurements require separately reviewed extraction methods.
"""
import json, re, sys
from html.parser import HTMLParser

DISALLOWED = {'script','style','nav','footer','header','form','aside','noscript','svg','button'}
BLOCKS = {'h1','h2','h3','p','li'}
BAT = re.compile(r'(?<!\d)(?P<h>\d{1,3}(?:\.\d+)?)\s*(?:hours?|hrs?)\b(?:\s+and\s+(?P<m>\d{1,2})\s+minutes?)?',re.I)
MINS = re.compile(r'(?<!\d)(?P<m>\d{1,4})\s*minutes?\b',re.I)
TIME = re.compile(r'\b(?:battery|playback|runtime|run\s*time|lasting|lasts?|ANC|noise\s*cancell?ation|charge)\b',re.I)
BLOCKED = re.compile(r'\b(?:Locked|Join Now|See Price|Amazon|Adverti[sz]ement|Offer|Coupon)\b',re.I)
ALLOWED = re.compile(r'^[\w .+\-()]{4,100}$',re.U)

class ArticleBlocks(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.html=html
        self.starts=[0]
        for m in re.finditer('\n',html): self.starts.append(m.end())
        self.block=None
        self.items=[]
        self.skip=0
    def input_position(self):
        line,col=self.getpos()
        return self.starts[line-1]+col
    def handle_starttag(self,tag,attrs):
        if tag in DISALLOWED: self.skip+=1
        if self.skip: return
        if tag in BLOCKS and self.block is None:
            self.block={'tag':tag,'begin':self.input_position(),'text':[]}
    def handle_endtag(self,tag):
        if tag in DISALLOWED:
            self.skip=max(0,self.skip-1)
            return
        if self.skip:return
        if self.block and self.block['tag']==tag:
            raw=self.html[self.block['begin']:self.input_position()+len(tag)+3]
            t=' '.join(''.join(self.block['text']).split())
            if 6<=len(t)<=1500 and len(raw)<=4500 and len(self.items)<5000:
                self.items.append((tag,t,raw))
            self.block=None
    def handle_data(self,data):
        if not self.skip and self.block:
            self.block['text'].append(data)

def read(html, expected_model, comparison_models=None):
    if not isinstance(html,str) or len(html.encode('utf8'))>750000:
        raise ValueError('review_html_size_cap')
    if not isinstance(expected_model,str) or not ALLOWED.fullmatch(expected_model):
        raise ValueError('bad_expected_model')
    p=ArticleBlocks(html);p.feed(html)
    headers=[t for tag,t,_ in p.items if tag=='h1']
    if len(headers)!=1:
        raise ValueError('one_review_heading_required')
    title=headers[0]
    def norm(s):return re.sub('[^a-z0-9]','',s.lower())
    if norm(expected_model) not in norm(title):
        raise ValueError('exact_model_not_in_heading')
    comparison=bool(re.search(r'\b(?:vs\.?|versus|compare|comparison)\b',title,re.I))
    if comparison:
        if (not isinstance(comparison_models,list) or len(comparison_models)<2 or
            len(comparison_models)>5 or expected_model not in comparison_models or
            len(set(comparison_models))!=len(comparison_models) or
            any(not isinstance(m,str) or not ALLOWED.fullmatch(m) or
                norm(m) not in norm(title) for m in comparison_models)):
            raise ValueError('multi_product_review_requires_reviewed_comparison_recipe')
    found=[]
    for tag,t,raw in p.items:
        if tag!='p' or BLOCKED.search(t) or not TIME.search(t) or len(t)>700:continue
        matches=list(BAT.finditer(t))
        for match in matches:
            hrs=float(match.group('h'))
            mins=int(match.group('m') or '0')
            if not (0<hrs<=200 and 0<=mins<60):continue
            if comparison:
                # Attribute each numeric result to the closest explicitly named
                # model PRECEDING it in the same paragraph. Unnamed shorthand is
                # not enough: another model may have intervened.
                preceding=[]
                for model in comparison_models:
                    for mention in re.finditer(re.escape(model),t,re.I):
                        if mention.end()<=match.start():preceding.append((mention.end(),model))
                if not preceding:continue
                last_pos,owner=max(preceding,key=lambda x:x[0])
                if owner!=expected_model or match.start()-last_pos>100:continue
            elif len(matches)>1:
                # Ambiguous multiple numbers in a single-model paragraph.
                continue
            # 27 h can describe measured continuous runtime in the context of ANC.
            # Do not infer 'ANC enabled' if the paragraph doesn't say it.
            context='anc_on' if re.search(r'\b(?:ANC|noise cancellation)\b',t,re.I) else 'unspecified'
            literal=match.group(0)
            if literal not in raw:
                # Inline markup may split the phrase; never invent an anchor.
                continue
            idx=raw.find(literal)
            start=max(0,idx-35);end=min(len(raw),idx+len(literal)+65)
            anchor=raw[start:end]
            if len(anchor)<10 or len(anchor)>300:continue
            if re.search(r'\b(?:claimed|manufacturer|advertised|rated|promises?)\b',t,re.I):continue
            found.append({'field_key':'continuous_battery_hours','number':round(hrs+mins/60,6),
               'unit':'hours','usage':context,'literal':literal,'anchor':anchor})
    # Deduplicate repeated exact values; conflicting values are ambiguous.
    unique={ (x['number'],x['usage']):x for x in found }
    if len({x['number'] for x in unique.values()})>1:
        raise ValueError('conflicting_article_battery_measurements')
    if len(unique)>1:
        # Same observation repeated under varying context is not enough to infer ANC.
        chosen=next((x for x in unique.values() if x['usage']=='anc_on'),next(iter(unique.values())))
        unique={(chosen['number'],chosen['usage']):chosen}
    return {'model':expected_model,'article_type':('multi_product_comparison' if comparison else 'single_product_professional_review'),
            'facts':list(unique.values())[:5], 'source_html_saved':False}

def main():
    try:
        arg=json.load(sys.stdin)
        result=read(arg['html'],arg['expected_model'],arg.get('comparison_models'))
        print(json.dumps({'ok':True,'result':result},ensure_ascii=True))
    except Exception as e:
        print(json.dumps({'ok':False,'error':str(e)[:140]}))
        sys.exit(1)
if __name__=='__main__':main()
