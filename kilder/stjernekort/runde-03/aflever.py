from kontaktark import *
import hashlib,subprocess
report=[]
for a in M['assets']:
    path=THEME/(a['id']+'.'+a['format'])
    if not path.exists():continue
    info={'id':a['id'],'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    if a['format']=='png':
        im=Image.open(path);alpha=np.array(im.getchannel('A'));ys,xs=np.where(alpha>8)
        info.update(size=list(im.size),mode=im.mode,fyld_pct=round(100*max(xs.max()-xs.min()+1,ys.max()-ys.min()+1)/max(im.size),2),top_pct=round(100*ys.min()/im.height,2),bund_synlige_pixels=int((alpha[-1]>8).sum()),sidepixels=int((alpha[:,0]>8).sum()+(alpha[:,-1]>8).sum()))
    report.append(info)
(HERE/'kvalitetsrapport.json').write_text(json.dumps({'assets':report},indent=2),encoding='utf8')
result=subprocess.run(['node','tools/tjek-assets.mjs'],cwd=ROOT,capture_output=True,text=True,encoding='utf8')
(HERE/'asset-tjek.txt').write_text(result.stdout+'\nExitkode: '+str(result.returncode)+'\n',encoding='utf8')

canvas=Image.new('RGB',(1440,1700),'#0A0D24');d=ImageDraw.Draw(canvas)
d.text((40,28),'STJERNEKORT / RUNDE 03',font=font(34,True),fill='#F2EAD8')
d.text((40,80),'Kobber og jern · Ressourcer · Monstre · Rettelser',font=font(21),fill='#9AA2C8')
for row,family in enumerate(['kobbergear','jerngear']):
    y=120+row*196
    d.rounded_rectangle((32,y,1408,y+184),radius=10,fill='#121735')
    d.text((48,y+18),family.upper(),font=font(18,True),fill='#9AA2C8')
    for j,a in enumerate([a for a in M['assets'] if a['familie']==family]):
        x=280+j*220;im=Image.open(THEME/(a['id']+'.png'))
        paste(canvas,im,x,y+4,128);paste(canvas,im,x+132,y+102,24)
        d.text((x-8,y+144),a['id'].split('/')[1],font=font(16),fill='#F2EAD8')
y=524;d.text((40,y),'RESSOURCER',font=font(21,True),fill='#9AA2C8')
for j,a in enumerate([a for a in M['assets'] if a['familie']=='ressourcer']):
    x=40+j*138;im=Image.open(THEME/(a['id']+'.png'))
    paste(canvas,im,x,y+42,96);paste(canvas,im,x+96,y+112,16)
    d.text((x,y+145),a['id'].split('/')[1],font=font(14),fill='#F2EAD8')
y=726;d.text((40,y),'PORTRÆTTER PÅ FÆLLES BAGGRUND',font=font(21,True),fill='#9AA2C8')
plate=Image.open(THEME/'baggrunde/portraet.jpg').convert('RGBA')
for j,a in enumerate([a for a in M['assets'] if a['familie']=='portraetter']):
    x=42+(j%4)*346;yy=y+46+(j//4)*234
    im=plate.copy();im.alpha_composite(Image.open(THEME/(a['id']+'.png')))
    paste(canvas,im,x,yy,180);paste(canvas,im,x+198,yy+116,64)
    d.text((x,yy+190),a['id'].split('/')[1],font=font(17),fill='#F2EAD8')
y=1258;d.text((40,y),'RETTEDE MALMNODER OG GLYFFER',font=font(21,True),fill='#9AA2C8')
for j,id in enumerate(['noder/kobbermalm','noder/jernmalm','noder/dyb-aare']):
    x=40+j*240;im=Image.open(THEME/(id+'.png'));paste(canvas,im,x,y+48,160)
    d.text((x,y+214),id.split('/')[1],font=font(17),fill='#F2EAD8')
for j,name in enumerate(['atk','slot-vaaben','slot-bryst','slot-ben','dungeon','boss']):
    x=800+(j%3)*194;yy=y+56+(j//3)*104
    im=Image.open(HERE/'glyf-preview'/(name+'.png'));paste(canvas,im,x,yy,48);paste(canvas,im,x+64,yy+24,24)
    d.text((x,yy+54),name,font=font(15),fill='#F2EAD8')
d.text((40,1590),str(len(report))+' / 106 assets leveret',font=font(28,True),fill='#6DD58C')
d.text((40,1634),'Gear også vist i 24 px · Portrætter også vist i 64 px · Fuld kontrol i familiearkene',font=font(18),fill='#9AA2C8')
canvas.save(HERE/'oversigt.png',optimize=True)
print(result.stdout)
