from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
r=Path(__file__).resolve().parents[2]
f=r/'evaluation/phase233'; f.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
def build(name,lines):
 p=f/('SYNTHETIC-'+name+'.pdf');c=canvas.Canvas(str(p),pagesize=(640,800),pageCompression=1);c.setFont('DejaVu',10)
 for i,(left,right) in enumerate(lines):
  y=755-i*28
  c.drawString(45,y,left)
  if right:c.drawString(290,y,right)
 c.save()
build('valid',[
 ('Technical specifications frontal C-arm',''),
 ('Source Image Distance','89.5-119.5 cm (35.2-47.1 inch)'),
 ('Technical specifications lateral L-arc',''),
 ('Source-image distance','87.9 - 130.6 cm (34.6 - 51.4 inch), motorized and manual movement'),
 ('Input voltage: Low voltage = 100–120 V, High voltage = 200–240 V',''),
 ('Operating temperature range: 32°–104°F / 0°–40°C',''),
 ('Water pressure required: 14.5–116 psi','')])
build('invalid',[
 ('Height: 10-20 cm',''),
 ('Source Image Distance','119.5-89.5 cm'),
 ('Source Image Distance','89.5-119.5 cm certified'),
 ('Input voltage: Low voltage = 100-120 V, High voltage = 200-240 hz',''),
 ('Source Image Distance','89.5-119.5 cm and 1-2 kg'),
 ('Source Image Distance','90-90 cm'),
 ('Source Image Distance','20-30 nanometres'),
 ('Source Image Distance','90-100 cm; Option for other device')])
build('scoped',[
 ('Technical specifications frontal C-arm',''),
 ('Source Image Distance','80-100 cm'),
 ('Technical specifications lateral L-arc',''),
 ('Source Image Distance','80-100 cm')])
build('unscoped',[
 ('Our model A performs at 100–200 V',''),
 ('A marketing range of 5–10 kg is offered',''),
 ('Source Image Distance','12-18 cm')])
print(*[(p.name,p.stat().st_size) for p in sorted(f.glob('*.pdf'))],sep='\n')
