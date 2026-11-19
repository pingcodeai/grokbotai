from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT = Path(__file__).resolve().parents[1]
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'
INK = '#111111'
PAPER = '#fbf5e5'

def render(slug, usage):
    im = Image.new('RGB', (2400, 1260), PAPER)
    d = ImageDraw.Draw(im)
    def box(bounds, color, stroke=None, width=3):
        d.rectangle(tuple(int(v*2) for v in bounds), fill=color, outline=stroke, width=width*2)
    def text(x, y, value, size=24, color=INK):
        d.text((x*2,y*2), value, font=ImageFont.truetype(FONT,size*2), fill=color)
    def line(points, color=INK, width=3):
        d.line([(int(x*2),int(y*2)) for x,y in points], fill=color, width=width*2)
    def card(bounds,color):
        x,y,r,b = bounds
        box((x+10,y+10,r+10,b+10),INK)
        box(bounds,color,INK,4)
    for x in range(0,1200,28): line([(x,0),(x,630)],'#e6dfcc',1)
    for y in range(0,630,28): line([(0,y),(1200,y)],'#e6dfcc',1)
    box((56,48,392,94),INK)
    text(72,60,'GROK BOT / FIELD NOTES',17,'white')
    accent = '#79c4f7' if usage else '#b8d99b'
    box((56,120,184,163),accent,INK)
    text(72,131,'问题排查' if usage else '场景实战',20)
    text(54,216,'额度怎么' if usage else 'Grok Bot',60)
    text(54,292,'这么快用完？' if usage else '怎么备份？',60)
    text(58,397,'先查任务，再看用量' if usage else '换环境前，先保存这些资料',26)
    line([(58,465),(600,465)],width=4)
    text(58,491,'例行任务 / 重复运行 / 无效重试' if usage else '工作方法 / 文件副本 / 恢复检查',20)
    card((662,72,1132,517),accent)
    box((662,72,1132,120),INK)
    text(684,87,'USAGE / TASK REVIEW' if usage else 'BACKUP / RESTORE',19,'white')
    if usage:
        card((690,145,1100,291),PAPER)
        text(711,165,'用量排查',24)
        for i,color in enumerate(['#b7dfad','#e9dc8a','#f49b80','#ef6262']):
            box((713+i*90,216,792+i*90,244),color,INK,2)
        line([(980,260),(980,204)],width=4)
        d.polygon([(1940,416),(1980,416),(1960,394)],fill=INK)
        for y,label,color in [(321,'例行任务','#fff1ae'),(378,'重复执行','#ffd2cd'),(435,'失败重试','#fffdf7')]:
            box((690,y,1100,y+43),color,INK)
            box((705,y+13,722,y+30),INK)
            text(740,y+10,label,21)
            line([(1054,y+21),(1076,y+21)])
    else:
        box((709,173,864,216),'#fff1ae',INK,4)
        card((699,207,1048,324),'#fff1ae')
        text(722,234,'工作资料',29)
        text(723,280,'SKILL / FILES / ROUTINE',16)
        line([(1081,241),(1096,241),(1096,366),(1067,366)],width=5)
        d.polygon([(2134,712),(2134,752),(2106,732)],fill=INK)
        card((728,349,1041,474),PAPER)
        for y,label in [(364,'保留副本'),(398,'核对清单'),(432,'恢复验证')]:
            box((748,y+2,771,y+25),accent,INK,2)
            line([(753,y+13),(759,y+19),(767,y+8)])
            text(790,y+2,label,21)
    box((1067,550,1159,606),INK)
    box((1057,540,1149,596),PAPER,INK,4)
    text(1077,557,'022' if usage else '024',24)
    output=ROOT/'public/images'/(slug+'-cover.webp')
    assert not output.exists(), str(output)
    im.resize((1200,630),Image.Resampling.LANCZOS).save(output,'WEBP',quality=88,method=6)
    print(output,output.stat().st_size)

if __name__ == '__main__':
    render('grok-bot-usage-troubleshooting',True)
    render('grok-bot-backup-restore-guide',False)
