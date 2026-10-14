#!/usr/bin/env python3
"""Create fabricated technical manuals for bounded PDF reader tests."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
OUT=Path(__file__).resolve().parent.parent/'evaluation'/'phase238'
OUT.mkdir(exist_ok=True,parents=True)
def make(name, full=True, modes=True, bad=''):
 p=OUT/name;c=canvas.Canvas(str(p),pagesize=A4)
 def page(lines):
  y=785
  for line in lines:
   c.setFont('Helvetica',9);c.drawString(30,y,line);y-=18
  c.showPage()
 arr=['TECHNICAL SPECIFICATIONS EN','TECHNICAL DESCRIPTION','Power supply: 220-240 V; 50-60 Hz',
      'Nominal power: 1550 W', 'Dimensions: Height 14.09in (358 mm) - Width 8.66in (220 mm) - Length 17.12in (435 mm)',
      'Water tank removable type: 50.7 fl oz (1.5 l) without filter - 43.9 fl oz (1.3 l) with filter',
      'Weight: 22 lb (10 kg)','COMMUNICATION MODULE']
 # PDF source may show bullet as unicode character; use reportlab Symbol? replace with literal PDF standard bullet cp1252.
 # Helvetica supports \u2022 in WinAnsi (ReportLab encodes it).
 arr=[('• '+x if x.startswith(('Power supply:', 'Nominal power:','Dimensions:','Water tank','Weight:')) else x) for x in arr]
 if not full:arr=[line for line in arr if not line.startswith('• Water tank')]+['• Water tank removable type: 50.7 fl oz (1.5 l) without filter - 43.9 fl oz (1.3 l) with UNKNOWN FILTER']
 if bad=='noheader':arr=[x.replace('TECHNICAL SPECIFICATIONS EN','DISHWASHER RECIPE GUIDE') for x in arr]
 page(arr)
 page(['DEVICE OPERATION','In NETWORKED STANDBY mode the power consumption of the machine is 0.6 W.','In LOW POWER mode the power consumption of the machine is 0.47 W.'] if modes else ['Recipes: 0.6 W used for a test but not a product setting.'])
 c.save()
make('SYNTHETIC-english-manual-good.pdf')
make('SYNTHETIC-english-manual-ambiguous-filter.pdf',full=False)
make('SYNTHETIC-english-manual-no-heading.pdf',bad='noheader')
