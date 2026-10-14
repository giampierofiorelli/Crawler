"""Self-contained layout tests. The real manufacturer PDFs must never be packaged."""
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
ROOT=Path(__file__).resolve().parent

def make(name, scenario):
    path=ROOT/(name+'.pdf')
    c=Canvas(str(path),pagesize=(600,780),pageCompression=1)
    def txt(x,y,s):
        c.setFont('Helvetica',10);c.drawString(x,y,s)
    txt(40,730,'Technical component specifications')
    txt(40,690,'Name')
    names=['T1-1','Q2-1','R3-1']
    if scenario=='duplicate': names=['T1-1','T1-1','R3-1']
    if scenario=='two':names=names[:2]
    xs=[225,295,365]
    for x,n in zip(xs,names):txt(x,690,n)
    txt(40,672,'Number of elements')
    for x,n in zip(xs,names):txt(x,672,str(80 if x==225 else 96 if x==295 else 128))
    txt(40,653,'Scanplane aperture')
    for x,n in zip(xs,names):txt(x,653,('12 mm' if x==225 else '14 mm' if x==295 else '16 mm'))
    if scenario=='ambiguous': txt(301,653,'19 mm')
    txt(40,635,'Application')
    txt(40,615,'Number of elements')
    for x,n in zip(xs,names):txt(x,615,'900')
    txt(40,595,'Net weight')
    for x,n in zip(xs,names):txt(x,595,'4 kg')
    c.save()
    print(path.name)
for n in ['normal','ambiguous','duplicate','two']:
    make('SYNTHETIC-'+n,n)

c=Canvas(str(ROOT/'SYNTHETIC-speed-units.pdf'),pagesize=(600,780),pageCompression=1)
c.setFont('Helvetica',11)
for y,txt in [(730,'Speed: 6 cm/s'),(710,'Speed: 10 mm/s'),(690,'Height: 30 cm'),(670,'Speed: 4 cm/something')]:c.drawString(40,y,txt)
c.save()
