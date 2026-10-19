#!/usr/bin/env python3 -I
"""S86d: annotation worksheets for the blind reference (the S86b builder, previously run inline, now versioned for the frozen
independent run). For each page of a manifest: the visible text as numbered lines (paragraphs, list items, headings, table
rows with ' | ' between cells); <page>.txt keeps the lines holding a digit, <page>.full.txt every line. PRIVATE output only
(third-party text): never commit it.
  python3 -I scripts/s86d-worksheets.py MANIFEST OUT_DIR"""
import json,os,re,sys
from html.parser import HTMLParser
BLOCK={'p','li','h1','h2','h3','h4','h5','h6','tr','caption','figcaption','dt','dd','blockquote','div','td','th','section','article','header','footer','summary'}
class P(HTMLParser):
    def __init__(s):super().__init__();s.lines=[];s.cur=[];s.skip=0;s.intr=0
    def flush(s):
        t=re.sub(r'\s+',' ',''.join(s.cur)).strip();s.cur=[]
        if t:s.lines.append(t)
    def handle_starttag(s,t,a):
        if t in('script','style','svg','noscript','template','iframe'):s.skip+=1;return
        if t=='tr':s.flush();s.intr=1;return
        if t in('td','th') and s.intr:s.cur.append(' | ');return
        if t=='br':s.cur.append(' ');return
        if t in BLOCK and not s.intr:s.flush()
    def handle_endtag(s,t):
        if t in('script','style','svg','noscript','template','iframe'):s.skip=max(0,s.skip-1);return
        if t=='tr':s.intr=0;s.flush();return
        if t in BLOCK and not s.intr:s.flush()
    def handle_data(s,d):
        if not s.skip:s.cur.append(d)
man,out=sys.argv[1],sys.argv[2];os.makedirs(out,exist_ok=True);base=os.path.dirname(os.path.abspath(man))
for e in json.load(open(man)):
    p=P();p.feed(open(os.path.join(base,e['file']),'rb').read().decode('utf8','replace'));p.flush()
    name=os.path.basename(e['file']).rsplit('.',1)[0];lines=p.lines
    keep=[(i+1,l) for i,l in enumerate(lines) if re.search(r'\d',l)]
    head=f"PAGE {os.path.basename(e['file'])}\nURL {e['url']}\nCATEGORY {e['category']}\nTITLE {lines[0][:200] if lines else ''}\n"
    open(os.path.join(out,name+'.txt'),'w').write(head+"\n".join(f"L{n}: {l[:1200]}" for n,l in keep)+"\n")
    open(os.path.join(out,name+'.full.txt'),'w').write("\n".join(f"L{i+1}: {l}" for i,l in enumerate(lines))+"\n")
print(len(json.load(open(man))),'pages')
