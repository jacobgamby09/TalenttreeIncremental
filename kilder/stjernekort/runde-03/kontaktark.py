from efterbehandling import *
from PIL import ImageDraw,ImageFont,ImageOps
import math
M=json.loads((ROOT/'temaer/asset-manifest.json').read_text(encoding='utf8'))
OUT=ROOT/'kilder/stjernekort/kontaktark';OUT.mkdir(parents=True,exist_ok=True)
def font(n,bold=False):return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),n)
def paste(canvas,im,x,y,n):
    im=im.convert('RGBa').resize((n,n),Image.Resampling.LANCZOS).convert('RGBA')
    canvas.paste(im,(int(x),int(y)),im)
def sheet(family,assets):
    glyph=family=='glyffer'
    cols=4 if glyph else min(len(assets),4)
    cw,ch=(320,210) if glyph else (320,600) if family=='portraetter' else (320,450)
    rows=math.ceil(len(assets)/cols)
    canvas=Image.new('RGB',(max(cols*cw+48,760),rows*ch+130),'#0A0D24');d=ImageDraw.Draw(canvas)
    d.text((24,20),family.upper()+' / RUNDE 03',font=font(25,True),fill='#F2EAD8')
    d.text((24,62),'Farve + gråtoner · Faktiske ikonmål i px · Nodeflade #121735',font=font(16),fill='#9AA2C8')
    for i,a in enumerate(assets):
        x=24+(i%cols)*cw;y=108+(i//cols)*ch
        d.rounded_rectangle((x,y,x+cw-16,y+ch-16),radius=8,fill='#121735')
        name=a['id'].split('/')[1]
        d.text((x+12,y+10),name,font=font(17,True),fill='#F2EAD8')
        path=HERE/'glyf-preview'/f'{name}.png' if glyph else THEME/(a['id']+'.'+a['format'])
        if glyph and not path.exists():path=ROOT/'kilder/stjernekort/runde-02/glyf-preview'/f'{name}.png'
        im=Image.open(path).convert('RGBA')
        if family=='portraetter':
            bg=Image.open(THEME/'baggrunde/portraet.jpg').convert('RGBA').resize(im.size)
            bg.alpha_composite(im);im=bg
        gray=ImageOps.grayscale(im).convert('RGBA');gray.putalpha(im.getchannel('A'))
        if glyph:
            sizes=[24,32] if name.startswith(('slot-','socket-')) else [14,16,24,32]
            for j,n in enumerate(sizes):
                xx=x+14+j*68
                paste(canvas,im,xx,y+48,n);paste(canvas,gray,xx,y+104,n)
                d.text((xx,y+154),str(n),font=font(13),fill='#9AA2C8')
        elif a['id'].startswith('baggrunde/'):
            paste(canvas,im,x+28,y+48,248)
            d.text((x+12,y+328),f"{a['bredde']} × {a['hoejde']} · {a['format'].upper()}",font=font(16),fill='#9AA2C8')
        else:
            paste(canvas,im,x+60,y+42,180)
            sizes=[64,128] if a['id'].startswith('portraetter/') else [24,32,64] if a['id'].startswith('emblemer/') else [16,32] if a['id'].startswith('ressourcer/') else [56,72]
            if a['familie'] in ['kobbergear','jerngear']:sizes=[24,56,72]
            cursor=x+12
            for n in sizes:
                paste(canvas,im,cursor,y+234,n)
                paste(canvas,gray,cursor,y+234+max(sizes)+16,n)
                d.text((cursor,y+234+2*max(sizes)+21),str(n)+' px',font=font(13),fill='#9AA2C8')
                cursor+=max(n+20,70)
    canvas.save(OUT/(family+'.png'),optimize=True)

if __name__=='__main__':
    families=['malme','minedrift-modifiers','glyffer','portraetter','kobbergear','jerngear','ressourcer']
    for family in families:
        assets=[a for a in M['assets'] if a['familie']==family and (THEME/(a['id']+'.'+a['format'])).exists()]
        if assets:sheet(family,assets)
    print('Kontaktark opdateret')
