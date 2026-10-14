"""Fictional, tiny PDF fixtures; original publisher documents not redistributed."""
from pathlib import Path
from reportlab.pdfgen import canvas
D=Path(__file__).parent

def make(name,lines):
 c=canvas.Canvas(str(D/name),pagesize=(750,850),pageCompression=0)
 c.setFont('Helvetica',11)
 for i,text in enumerate(lines):
  c.drawString(30,810-i*19,text)
 c.save()

head=['Milk beverage preparation','The machine has a kit available complete','with two milk tubes.']
ifline='If a fridge (optional item) is combined with the'
second='machine, the 19.6" (50 cm) tube shall be used.'
other='Otherwise, the 15.7" (40 cm) tube shall be used.'
make('SYNTHETIC-conditional-pair.pdf',head+[ifline,second,other])
make('SYNTHETIC-missing-else.pdf',head+[ifline,second])
make('SYNTHETIC-missing-kit.pdf',[ifline,second,other])
make('SYNTHETIC-conflicting-conversion.pdf',head+[ifline,'machine, the 19.6" (95 cm) tube shall be used.',other])
make('SYNTHETIC-unpaired-section.pdf',head+[ifline,'The product is not designed for milk. ',other])
make('SYNTHETIC-conditional-with-declared-model.pdf',['Model: ABC-123']+head+[ifline,second,other])
prog=['YOGURT FUNCTION','Press Menu to select "Yogurt". The screen',
      'displays the default cooking time of 8 hours. The cooking time is',
      'adjustable from a minimum of 6 hours to a maximum of 12 hours.']
make('SYNTHETIC-program.pdf',prog)
make('SYNTHETIC-recipe-only.pdf',['YOGURT FUNCTION','Recipe: Stir for 6 hours to 12 hours.',
 'The cooking time is adjustable from a minimum of 6 hours to a maximum of 12 hours.'])
make('SYNTHETIC-program-contradiction.pdf',prog[:-1]+['adjustable from a minimum of 9 hours to a maximum of 12 hours.'])
make('SYNTHETIC-program-unrelated-heading.pdf',prog+['STEAM FUNCTION'])
make('SYNTHETIC-program-duplicate.pdf',prog+prog[1:])
print('generated')
