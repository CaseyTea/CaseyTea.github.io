"""Build the single-column resume from content/resume.md.

Requires reportlab and pypdf. Run from any directory with Python 3.
The public PDF is the shared download for both portfolio views.
"""
from pathlib import Path
from html import escape
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import reportlab
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/assets/Casey_Franceschy.pdf'
GREEN = colors.HexColor('#193f31')
TEXT = colors.HexColor('#202a26')
MUTED = colors.HexColor('#4b5b52')
# Embed fonts so the PDF has consistent weight and layout on every device.
font_dir = Path('/System/Library/Fonts/Supplemental')
if (font_dir / 'Arial.ttf').exists():
    font_files = ['Arial.ttf', 'Arial Bold.ttf', 'Arial Italic.ttf']
else:
    font_dir = Path(reportlab.__file__).parent / 'fonts'
    font_files = ['Vera.ttf', 'VeraBd.ttf', 'VeraIt.ttf']
for name, filename in zip(['Resume', 'Resume-Bold', 'Resume-Italic'], font_files):
    pdfmetrics.registerFont(TTFont(name, str(font_dir / filename)))
pdfmetrics.registerFontFamily('Resume', normal='Resume', bold='Resume-Bold',
                              italic='Resume-Italic', boldItalic='Resume-Bold')
styles = {
    'name': ParagraphStyle('name', fontName='Resume-Bold', fontSize=23, leading=26, textColor=GREEN, spaceAfter=4),
    'contact': ParagraphStyle('contact', fontName='Resume', fontSize=10, leading=13, textColor=MUTED, spaceAfter=1),
    'headline': ParagraphStyle('headline', fontName='Resume-Bold', fontSize=10.5, leading=14, textColor=TEXT, spaceAfter=3),
    'section': ParagraphStyle('section', fontName='Resume-Bold', fontSize=10.5, leading=14, textColor=GREEN, spaceBefore=9, spaceAfter=4, keepWithNext=True),
    'job': ParagraphStyle('job', fontName='Resume-Bold', fontSize=10.5, leading=14, textColor=TEXT, spaceBefore=7, spaceAfter=2, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='Resume', fontSize=10.5, leading=14, textColor=TEXT, spaceAfter=3, alignment=TA_LEFT),
    'role': ParagraphStyle('role', fontName='Resume-Italic', fontSize=10.5, leading=14, textColor=MUTED, spaceAfter=4, keepWithNext=True),
    'bullet': ParagraphStyle('bullet', fontName='Resume', fontSize=10.5, leading=14, textColor=TEXT, leftIndent=9, firstLineIndent=-9, spaceAfter=3),
}


def linked(text):
    text = escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    targets = [
        ('casey.franceschy@gmail.com', 'mailto:casey.franceschy@gmail.com'),
        ('github.com/CaseyTea', 'https://github.com/CaseyTea'),
        ('caseytea.github.io/recruiters/', 'https://caseytea.github.io/recruiters/'),
        ('linkedin.com/in/casey-franceschy-694823124/', 'https://www.linkedin.com/in/casey-franceschy-694823124/'),
    ]
    for label, url in targets:
        text = re.sub(re.escape(label), f'<link href="{url}">{label}</link>', text)
    return text


story = []
in_header = True
previous_job = False
for line in (ROOT / 'content/resume.md').read_text().splitlines():
    if not line.strip():
        continue
    if line.startswith('# '):
        style, text = 'name', line[2:]
    elif line.startswith('## '):
        in_header = False
        style, text = 'section', line[3:].upper()
    elif line.startswith('### '):
        style, text = 'job', line[4:]
    elif line.startswith('- '):
        style, text = 'bullet', '- ' + line[2:]
    elif in_header:
        style = 'headline' if line.startswith('Full-Stack') else 'contact'
        text = line
    elif previous_job and line in ['Information Services Analyst I: Programmer (Full-time)', 'Technical Specialist III', 'Quality Engineering Intern, Identity Services']:
        style, text = 'role', line
    else:
        style, text = 'body', line
    story.append(Paragraph(linked(text), styles[style]))
    previous_job = style == 'job'

doc = SimpleDocTemplate(str(OUTPUT), pagesize=letter, rightMargin=36, leftMargin=36,
                       topMargin=36, bottomMargin=36, title='Casey Franceschy - Full-Stack Software Engineer',
                       author='Casey Franceschy', subject='Software engineering resume')
doc.build(story)
reader = PdfReader(OUTPUT)
if len(reader.pages) != 1:
    raise SystemExit(f'Expected a one-page resume; got {len(reader.pages)}. Adjust the layout before delivering.')
print(f'Built {OUTPUT} ({len(reader.pages)} page; {len(reader.pages[0].extract_text().split())} words)')
