from efterbehandling import *
from PIL import ImageDraw,ImageFont
import subprocess,hashlib
M=json.loads((ROOT/'temaer/asset-manifest.json').read_text(encoding='utf8'))
report=[]
for a in M['assets']:
    path=THEME/(a['id']+'.'+a['format'])
    if not path.exists():continue
    info={'id':a['id'],'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    if a['format']=='png':
        im=Image.open(path);alpha=np.array(im.getchannel('A'))
        ys,xs=np.where(alpha>8)
        info.update(size=list(im.size),mode=im.mode,fyld_pct=round(100*max(xs.max()-xs.min()+1,ys.max()-ys.min()+1)/max(im.size),2),bund_synlige_pixels=int((alpha[-1]>8).sum()))
    report.append(info)
sky=np.asarray(Image.open(THEME/'baggrunde/stjernehimmel.jpg')).astype(float)
seams={'x':float(np.abs(sky[:,-1]-sky[:,0]).mean()),'y':float(np.abs(sky[-1]-sky[0]).mean()),'nabopixels_x':float(np.abs(sky[:,1:]-sky[:,:-1]).mean()),'nabopixels_y':float(np.abs(sky[1:]-sky[:-1]).mean())}
(HERE/'kvalitetsrapport.json').write_text(json.dumps({'assets':report,'jpg_soemme':seams,'visuel_kontrol':'Kontaktark i farve og gråtoner; JPG 3x3 gennemgået.'},indent=2),encoding='utf8')
result=subprocess.run(['node','tools/tjek-assets.mjs'],cwd=ROOT,capture_output=True,text=True,encoding='utf8')
(HERE/'asset-tjek.txt').write_text(result.stdout+'\nExitkode: '+str(result.returncode)+'\n',encoding='utf8')

def font(n,bold=False):return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),n)
canvas=Image.new('RGB',(1440,1500),'#0A0D24');d=ImageDraw.Draw(canvas)
d.text((40,28),'STJERNEKORT / RUNDE 02',font=font(34,True),fill='#F2EAD8')
d.text((40,78),'Rettet prøvebatch · 5 nodefamilier · 28 SVG-glyffer · portrætbaggrund',font=font(21),fill='#9AA2C8')
families=[('traeer','TRÆER'),('traefaeldning-modifiers','TRÆFÆLDNING'),('malme','MALME'),('minedrift-modifiers','MINEDRIFT'),('ovne','OVNE')]
for i,(family,title) in enumerate(families):
    y=124+i*166
    d.rounded_rectangle((32,y,1408,y+154),radius=10,fill='#121735')
    d.text((52,y+20),title,font=font(18,True),fill='#9AA2C8')
    assets=[a for a in M['assets'] if a['familie']==family]
    for j,a in enumerate(assets):
        x=300+j*270
        im=Image.open(THEME/(a['id']+'.png')).resize((128,128),Image.Resampling.LANCZOS)
        canvas.paste(im,(x,y+1),im)
        d.text((x-15,y+126),a['id'].split('/')[1],font=font(16),fill='#F2EAD8')

yy=970
d.text((40,yy),'RETTET PRØVEBATCH',font=font(21,True),fill='#F2EAD8')
plate=Image.open(THEME/'baggrunde/portraet.jpg').resize((156,156))
for j,id in enumerate(['portraetter/spiller','portraetter/ulv','emblemer/traefaeldning','noder/kobberbrystplade']):
    xx=52+j*250
    if id.startswith('portraetter'):canvas.paste(plate,(xx,yy+40))
    else:d.rectangle((xx,yy+40,xx+156,yy+196),fill='#121735')
    im=Image.open(THEME/(id+'.png')).resize((156,156),Image.Resampling.LANCZOS)
    canvas.paste(im,(xx,yy+40),im)
    d.text((xx,yy+204),id.split('/')[1],font=font(16),fill='#9AA2C8')
d.text((1060,yy+70),'52 / 106',font=font(36,True),fill='#6DD58C')
d.text((1060,yy+120),'assets leveret',font=font(20),fill='#9AA2C8')

yy=1230
d.text((40,yy),'GLYFFER',font=font(21,True),fill='#F2EAD8')
glyphs=[a for a in M['assets'] if a['familie']=='glyffer']
for i,a in enumerate(glyphs):
    x=48+(i%14)*98;y=yy+48+(i//14)*94
    im=Image.open(HERE/'glyf-preview'/(a['id'].split('/')[1]+'.png')).resize((40,40),Image.Resampling.LANCZOS)
    canvas.paste(im,(x+15,y),im)
    name=a['id'].split('/')[1].replace('slot-','')
    d.text((x,y+46),name,font=font(11),fill='#9AA2C8')
canvas.save(HERE/'oversigt.png',optimize=True)
print(result.stdout.splitlines()[1]);print('Oversigt og kvalitetsrapport gemt')
