#!/usr/bin/env python3
"""Only fictional testing documents; does not include publisher text/PDFs."""
from reportlab.pdfgen import canvas
from pathlib import Path
base=Path(__file__).resolve().parent.parent/'evaluation/phase239'
base.mkdir(exist_ok=True,parents=True)

def pdf(name,lines):
    p=base/('SYNTHETIC-'+name+'.pdf')
    c=canvas.Canvas(str(p),pagesize=(595,842),pageCompression=0)
    c.setFont('Helvetica',10);y=790
    for line in lines:
        if line is None:c.showPage();c.setFont('Helvetica',10);y=790;continue
        c.drawString(40,y,line);y-=18
    c.save()

head=['COOKING GUIDE','The following recommendations are for meal preparation, not independent performance tests.',
      'Manual programme                   Min-max             Temperature']
good=head+['Tofu cubes','Drawer 1                          8-12 min                 180°C','250 g',
  'Vegetable medley','Drawer 2                          10-16 min                175°C','300 g',
  'TIPS','User-adjustable settings do not prove cooking outcome.']
pdf('guide-good',good)
pdf('guide-no-load',head+['Tofu cubes','Drawer 1                         8-12 min                 180°C',
 'Vegetable medley','Drawer 2                         10-16 min                175°C','300 g'])
pdf('guide-no-header',['COOKING GUIDE','Tofu cubes','Drawer 1             8-12 min          180°C','250 g'])
pdf('guide-duplicate',head+['Tofu cubes','Drawer 1         8-12 min          180°C','250 g',
  'Tofu cubes','Drawer 1         10-16 min          175°C','300 g'])
pdf('guide-unsupported',head+['Tofu cubes','Drawer 2           8-12 min           320°C','250 g'])
pdf('guide-pictograms',head+['Drawer 1            8-12 min        180°C','250 g'])
pdf('manual-good',['USING ONLY ONE DRAWER OF THE APPLIANCE','Select manual settings before cooking.',
  'The thermostat varies from 40-200°C.','The timer can be set for between 0 and 60 minutes.'])
pdf('manual-bad',['USING ONLY ONE DRAWER OF THE APPLIANCE','Select manual settings before cooking.',
  'The thermostat varies from 50-300°C.','The timer can be set for between 80 and 60 minutes.'])
print('generated 8 fictional PDF fixtures')
