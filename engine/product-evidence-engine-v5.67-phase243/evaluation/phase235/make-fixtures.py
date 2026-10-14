"""Generate tiny synthetic geometry fixtures. Used only at development time."""
from reportlab.pdfgen import canvas
from pathlib import Path
D=Path(__file__).parent

def make(name,lines):
    c=canvas.Canvas(str(D/name), pagesize=(1200,800),pageCompression=0)
    c.setFont('Helvetica',10)
    for x,y,text in lines:c.drawString(x,y,text)
    c.save()
make('SYNTHETIC-catalog.pdf',[(30,740,'Product Code'),(280,740,'PWM 507'),(560,740,'PWM 507 Hygiene'),(850,740,'PWM 508 MopStar'),
 (30,715,'Capacity (kg)'),(280,715,'7'),(560,715,'7'),(850,715,'8'),
 (30,690,'Net Weight (kg)'),(280,690,'98'),(560,690,'101'),(850,690,'103'),
 (30,665,'Spin Speed (rpm)'),(280,665,'1600'),(560,665,'1600'),(850,665,'1400')])
make('SYNTHETIC-sheet.pdf',[(55,780,'Model identifier'),(460,780,'WWI860 WCS'),(55,750,'Weight in kg'),(460,750,'94'),(55,725,'Load in kg'),(460,725,'9'),
 (55,700,'Dimensions (H x W x D) in mm'),(460,700,'850 x 596 x 643'),
 (55,675,'Weighted water consumption per cycle in l'),(460,675,'48'),
 (55,645,'Weighted energy consumption per 100 operating cycles for'),(460,645,'49'),
 (55,631,'the wash cycle in kWh'),
 (55,590,'Voltage in V'),(460,590,'220 - 240'),
 (55,565,'Total rated load in kW'),(460,565,'2.10 - 2.40')])
make('SYNTHETIC-guard.pdf',[(30,760,'Product Code'),(280,760,'PWM 507'),(560,760,'PWM 507'),(850,760,'PWM 508'),
 (30,736,'Capacity (kg)'),(280,736,'7'),(560,736,'7'),(850,736,'8'),
 (30,710,'Net Weight (kg)'),(280,710,'98'),(560,710,'101'),(850,710,'103'),
 (30,600,'of pasta in the bowl (optional)'),(30,570,'2 Rice bowl (on certain models only)'),
 (30,545,'User quality control mode (Optional)')])
print('done')
