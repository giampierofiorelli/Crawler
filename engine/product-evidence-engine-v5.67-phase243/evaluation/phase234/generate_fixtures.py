"""Developer-only synthetic Phase234 fixtures. Requires reportlab, not a PEE runtime dependency."""
from pathlib import Path
from reportlab.pdfgen import canvas
BASE=Path(__file__).resolve().parent

def make(name,items):
 p=BASE/('SYNTHETIC-'+name+'.pdf'); c=canvas.Canvas(str(p),pagesize=(610,790))
 for x,y,t in items:
  c.setFont('Helvetica',10);c.drawString(x,y,t)
 c.save()

make('valid',[
 (42,745,'Manufacturer technical sheet'),
 (304,735,'Standard accessories (patient table)'),
 (42,720,'Optional accessories'),
 (304,717,'Mattress'),
 (304,700,'Patient straps'),
 (304,683,'Set of arm supports (if cradle option is chosen)'),
 (304,665,'Drip stand'),
 (304,625,'Optional accessories *'),
 (42,610,'Unrelated left-side product'),
 (304,608,'Panhandle'),
 (304,590,'Arm support, incl. arm pad'),
 (304,572,'Examination light'),
 (304,555,'*in case of OR table, restrictions may apply'),
 (304,535,'Another item'),
 (42,480,'4.1 ClarityIQ technology (Optional)'),
 (42,462,'Parallel working (standard)'),
])
make('no_scope',[
 (304,735,'Optional accessories *'),
 (304,718,'Panhandle'),
 (304,695,'Adapter'),
 (42,640,'Notes'),
])
make('status_only',[
 (42,720,'User quality control mode (optional)'),
 (42,698,'Automatic positioning (standard)'),
 (42,670,'Optional portability'),
 (42,640,'Manufacturer marketing: our technology is great'),
])
make('truncated',[
 (304,735,'Standard accessories (patient table)'),
 (304,715,'Mattress'),
 (304,695,'A sentence: describes capabilities.'),
 (304,678,'Bogus part'),
 (304,660,'Optional accessories *'),
 (304,642,'Head support'),
])
