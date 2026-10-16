from kontaktark import *
canvas=Image.new('RGB',(1050,980),'#0A0D24');d=ImageDraw.Draw(canvas)
d.text((30,22),'GEAR / KOBBER OG JERN',font=font(28,True),fill='#F2EAD8')
d.text((30,68),'24 px + 56 px i farve og gråtoner. Samme slot side om side.',font=font(18),fill='#9AA2C8')
d.text((235,112),'KOBBER',font=font(20,True),fill='#C88853');d.text((640,112),'JERN',font=font(20,True),fill='#AEBBD1')
for i,(id,label) in enumerate([('svaerd','Våben'),('hjelm','Hoved'),('brystplade','Bryst'),('benskinner','Ben'),('stoevler','Fødder')]):
    y=158+i*156
    d.rounded_rectangle((24,y,1026,y+142),radius=8,fill='#121735');d.text((42,y+52),label,font=font(20),fill='#F2EAD8')
    for j,metal in enumerate(['kobber','jern']):
        im=Image.open(THEME/('noder/'+metal+id+'.png'));gray=ImageOps.grayscale(im).convert('RGBA');gray.putalpha(im.getchannel('A'))
        x=235+j*405
        for k,(pic,n) in enumerate([(im,24),(im,56),(gray,24),(gray,56)]):
            xx=x+k*78;paste(canvas,pic,xx,y+40,n);d.text((xx,y+108),str(n),font=font(13),fill='#9AA2C8')
canvas.save(OUT/'gear-par.png')
