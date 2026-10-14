"""Synthetic isolated PDF variants; generator requires reportlab for development only."""
from pathlib import Path
from reportlab.pdfgen import canvas
root=Path(__file__).resolve().parent
cases={
 'valid': [
  'Manufacturer technical specification',
  'Net weight: WD04 = 9.37 lb / 4.25 kg; WD05 = 9.96 lb / 4.52 kg;',
  'WD06 = 18.47 lb / 8.38 kg',
  'Packaged weight: WD04 = 13.36 lb / 6.06 kg; WD05 = 14.64 lb / 6.64 kg;',
  'WD06 = 27.36 lb / 12.41 kg',
  'Filter',
  'Net weight: 1.5 kg',
 ],
 'duplicate': ['Technical specification','Net weight: WD04 = 4.25 kg; WD04 = 8.38 kg'],
 'badunit': ['Technical specification','Net weight: WD04 = 4.25 kg; WD05 = 9.96 lb'],
 'range': ['Technical specification','Net weight: WD04 = 3-5 kg; WD05 = 7 kg'],
 'onemodel': ['Technical specification','Net weight: WD04 = 4.25 kg'],
 'different': ['Technical specification','Net weight: HP101 = 1.25 kg; HP102 = 1.40 kg'],
 'component': ['Technical specification','Filter net weight: WD04 = 1.5 kg; WD05 = 1.8 kg'],
 'semanticnoise': ['Technical specification','Net weight: WD04 = 4.25 kg; WD05 = 4.52 kg; note that packaging varies'],
}
for k,lines in cases.items():
 p=canvas.Canvas(str(root/f'SYNTHETIC-{k}.pdf'),pagesize=(612,792));p.setFont('Helvetica',10)
 for i,line in enumerate(lines): p.drawString(40,750-i*24,line)
 p.save()
