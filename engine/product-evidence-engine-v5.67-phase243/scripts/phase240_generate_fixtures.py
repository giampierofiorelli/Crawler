#!/usr/bin/env python3
"""Developer-only original fictional PDF samples; not manufacturer documents."""
from pathlib import Path
from reportlab.pdfgen import canvas
out=Path('evaluation/phase240');out.mkdir(parents=True,exist_ok=True)
def emit(name,cues,values):
    path=out/('SYNTHETIC-'+name+'.pdf'); c=canvas.Canvas(str(path),pagesize=(650,780))
    c.setFont('Helvetica',12)
    if cues=='program':
        c.drawString(50,700,'Program')
        for i,v in enumerate(values):c.drawString(80+i*155,681,v)
        c.drawString(50,660,'length')
    elif cues=='grill':
        c.drawString(35,735,'Depending on thickness')
        for i,v in enumerate(values):c.drawString(150,700-i*35,v)
    else:
        c.drawString(35,740,'International guarantee country list')
        for i,v in enumerate(values):c.drawString(150,700-i*35,v)
    c.save()
emit('program-slots','program',['3 min 14 s','2 min 23 s','1 min 30 s'])
emit('invalid-seconds','program',['3 min 82 s','2 min 23 s','1 min 30 s','3 min 21 s'])
emit('grill-slots','grill',['5 - 11 min','3-4 min','7-9 min','15-25 min','3-5 min'])
emit('numbers-no-cue','none',['5 - 11 min','3-4 min','7-9 min','15-25 min','3-5 min'])
print('four fictional PDF fixtures generated')
