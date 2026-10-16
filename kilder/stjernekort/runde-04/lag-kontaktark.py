from kontaktark import *
T=json.loads((THEME/'tema.json').read_text(encoding='utf8'))
C=T['farver']
def toned(id,color,opacity=1):
    im=Image.open(THEME/(id+'.png')).convert('RGBA')
    out=Image.new('RGBA',im.size,color)
    out.putalpha(im.getchannel('A').point(lambda a:round(a*opacity)))
    return out
def panel(title,w,h,subtitle):
    im=Image.new('RGB',(w,h),C['baggrund']);d=ImageDraw.Draw(im)
    d.text((24,18),title,font=font(26,True),fill=C['tekst'])
    d.text((24,60),subtitle,font=font(16),fill=C['tekstDaempet'])
    return im,d
def background_sheet():
    canvas,d=panel('TONBARE LAG / RUNDE 04',1320,1250,'Farver og opacitet fra tema.json · Sømløse fliser vist som 3 × 3')
    for col,(id,color,opacity) in enumerate([('taage',C['taage'],T['taage']['opacitet']),('nebula',C['nebula'],.45)]):
        x=24+col*650
        d.text((x,104),f'{id} · {color} · opacitet {opacity}',font=font(19,True),fill=C['tekst'])
        tile=toned('baggrunde/'+id,color,opacity)
        for yy in range(3):
            for xx in range(3):paste(canvas,tile,x+xx*205,145+yy*205,205)
        # Full-size 3x3 composite retained for seam inspection beyond the thumbnail.
        full=Image.new('RGBA',(3072,3072),C['baggrund'])
        for yy in range(3):
            for xx in range(3):full.alpha_composite(tile,(xx*1024,yy*1024))
        full.convert('RGB').save(HERE/(id+'-3x3.png'),optimize=True)
    d.text((24,800),'Klyngeslør · opacitet 0,18 · alle otte klyngefarver',font=font(21,True),fill=C['tekst'])
    for i,(name,color) in enumerate(C['klynger'].items()):
        x=24+(i%4)*322;y=848+(i//4)*190
        paste(canvas,toned('baggrunde/klyngesloer',color,T['klyngesloer']['opacitet']),x+76,y,160)
        d.text((x+12,y+160),name+' · '+color,font=font(15),fill=C['tekstDaempet'])
    canvas.save(OUT/'baggrunde-runde-04.png',optimize=True)
def silhouette_sheet():
    assets=[a for a in M['assets'] if a['familie']=='silhuetter' and (THEME/(a['id']+'.png')).exists()]
    if not assets:return
    canvas,d=panel('SILHUETTER / RUNDE 04',1320,950,'Øverst: temaets farve og opacitet 0,25 · Nederst: alfa ved fuld styrke')
    for i,a in enumerate(assets):
        x=24+i*322
        d.text((x+8,108),a['id'].split('/')[1],font=font(20,True),fill=C['tekst'])
        paste(canvas,toned(a['id'],C['silhuet'],T['silhuetter']['opacitet']),x,155,304)
        paste(canvas,toned(a['id'],C['silhuet']),x,500,304)
    d.text((24,860),'Hvid RGB i filerne · 16 px transparent kant · Bunden fader gennem sidste fjerdedel',font=font(17),fill=C['tekstDaempet'])
    canvas.save(OUT/'silhuetter.png',optimize=True)
if __name__=='__main__':
    background_sheet();silhouette_sheet()

