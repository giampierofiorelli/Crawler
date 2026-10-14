"""Development-only fixtures. Synthetic values, never product evidence."""
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
p=Path(__file__).parent
c=Canvas(str(p/'SYNTHETIC-dual-unit-sectioned.pdf'),pagesize=(612,792))
c.setFont('Helvetica',12)
c.drawString(48,740,'Synthetic appliance specifications; fictional, not a product')
c.drawString(48,700,'Height: 20.0 in (508 mm), Width: 12.0 in (305 mm), Depth: 10.0 in (254 mm)')
c.drawString(48,670,'Input voltage: 120 V')
c.drawString(48,640,'Net weight: 15.43 lbs (7.0 kg)')
c.drawString(48,610,'Filter')
c.drawString(48,580,'Carbon Filter: H: 2 in (50 mm), Net weight: 1.2 lbs (0.54 kg)')
c.drawString(48,560,'Net weight: 0.9 lbs (0.4 kg)')
c.drawString(48,530,'Operation')
c.drawString(48,500,'Sound power level at airflow setting 2: 43.0 dBA')
c.save()
c=Canvas(str(p/'SYNTHETIC-page19-specification.pdf'),pagesize=(612,792))
for i in range(1,20):
 c.setFont('Helvetica',12);c.drawString(50,740,'Synthetic manual, page '+str(i))
 if i==19:
  c.drawString(50,680,'Rated Voltage');c.drawString(220,680,'14.4 V')
  c.drawString(50,650,'Rated Power');c.drawString(220,650,'75 W')
 c.showPage()
c.save()
