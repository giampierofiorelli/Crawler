#!/usr/bin/env python3
"""Generate wholly fictional/constructed PDF table layout fixtures for Phase237 tests.
Not manufacturer text; reportlab is a dev-only helper, NOT a PEE dependency.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape,A4
DIR=Path('evaluation/phase237');DIR.mkdir(parents=True,exist_ok=True)

def line(*pairs):
    arr=[' ']*145
    for pos,t in pairs:
        for k,ch in enumerate(t):
            assert pos+k<len(arr) and (arr[pos+k]==' ' or ch==' '),(pos,t,arr[pos+k])
            if ch!=' ':arr[pos+k]=ch
    return ''.join(arr).rstrip()

def fixture(name,food=True,temp=100,range_text='5min-3h',duplicates=False,missing_temp=False,bad_default=False,header=True):
    rows=[]
    if header:
        rows=['COOKING PROGRAMME TABLE',
          'Cooking Time                     Temperature (°C)',
          'Programs Automatic  Food  Default Range',
          'Manual (adjust temp. setting)',
          'Food Type Default Range',
          'Programs Automatic                 Default                Temperature Closed',
          '         Food                 Range',
          '', '',]
    else:rows=['COOKING RECIPE TIME GUIDE','Food Type Quantity Cooking time','', '', '', '', '', '', '']
    if food:
        rows += [line((38,'Veg      30min')),
                 line((38,'Fish     40min')),
                 line((5,'Simmer     4'),(55,range_text),*(([(98,f'{temp} °C')] if temp is not None else []))),
                 line((38,'Poultry  50min')),
                 line((38,'Veg      60min') if duplicates else (38,'Meat     60min'))]
        if missing_temp:rows[11]=line((5,'Simmer     4'),(55,range_text))
    else:
        rows += [line((5,'Braise     1'),(46,'210min' if bad_default else '25min'),(55,range_text),
              (98,f'{temp} °C' if temp is not None else ''))]
    pdf=DIR/f'{name}.pdf';c=canvas.Canvas(str(pdf),pagesize=landscape(A4));c.setFont('Courier',8)
    for i,l in enumerate(rows): c.drawString(22,565-i*12,l)
    c.save()

fixture('SYNTHETIC-multi-good')
fixture('SYNTHETIC-multi-duplicate-food',duplicates=True)
fixture('SYNTHETIC-multi-no-temperature',missing_temp=True)
fixture('SYNTHETIC-multi-broken-range',range_text='5min-XYZ')
fixture('SYNTHETIC-multi-unrelated-recipe',header=False)
fixture('SYNTHETIC-single-good',food=False)
fixture('SYNTHETIC-single-bad-default',food=False,bad_default=True)
fixture('SYNTHETIC-single-no-temperature',food=False,temp=None)
