"""Render the article cover in the site's established editorial style."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SCALE = 2
image = Image.new('RGB', (2400, 1260), '#fbf5e5')
draw = ImageDraw.Draw(image)
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'

def box(bounds, fill, outline=None, width=1):
    draw.rectangle(tuple(int(v * SCALE) for v in bounds), fill=fill, outline=outline, width=width * SCALE)

def text(position, value, size, fill='#111111'):
    draw.text(tuple(v * SCALE for v in position), value, font=ImageFont.truetype(FONT, size * SCALE), fill=fill, stroke_width=0)

for x in range(0, 1200, 28):
    draw.line((x * SCALE, 0, x * SCALE, 1260), fill='#e6dfcc', width=1)
for y in range(0, 630, 28):
    draw.line((0, y * SCALE, 2400, y * SCALE), fill='#e6dfcc', width=1)
box((58, 58, 390, 99), '#111111')
text((74, 70), 'GROK BOT / FIELD NOTES', 17, 'white')
box((58, 125, 157, 169), '#f14e52', '#111111', 3)
text((76, 137), '新手入门', 18)
text((55, 211), '别只把 Grok Bot', 46)
text((55, 272), '当聊天框', 58)
text((58, 367), 'Bot、任务、Skill、Routine', 26)
text((58, 409), '一次分清，开始交付工作', 25)
box((58, 466, 627, 471), '#111111')
text((58, 495), '谁来做 · 做什么 · 怎么做 · 何时做', 19)
box((679, 87, 1147, 521), '#111111')
box((666, 74, 1134, 508), '#74b9e8', '#111111', 5)
box((666, 74, 1134, 122), '#111111')
text((690, 90), 'FROM CHAT TO WORKFLOW', 19, 'white')
cards = [
    (690, 149, 'Bot', '谁来负责', '#fff3b2'),
    (910, 149, '任务', '这次做什么', '#fffdf7'),
    (690, 316, 'Skill', '按什么方法做', '#ffd1dc'),
    (910, 316, 'Routine', '什么时候做', '#d9ebc2'),
]
for x, y, title, subtitle, color in cards:
    box((x + 5, y + 5, x + 199, y + 151), '#111111')
    box((x, y, x + 194, y + 146), color, '#111111', 4)
    text((x + 18, y + 27), title, 32)
    text((x + 18, y + 91), subtitle, 19)
box((1063, 537, 1157, 597), '#eb4677')
box((1055, 525, 1146, 585), '#fffaf0', '#111111', 5)
text((1078, 545), '021', 24)
output = ROOT / 'public/images/grok-bot-chat-bot-task-skill-routine-cover.webp'
image.resize((1200, 630), Image.LANCZOS).save(output, 'WEBP', quality=92)
print(output)
