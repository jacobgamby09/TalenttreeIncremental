from kontaktark import *
import hashlib,subprocess
report=[]
for a in M['assets']:
    path=THEME/(a['id']+'.'+a['format'])
    if not path.exists():continue
    info={'id':a['id'],'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    if a['format']=='png':
        im=Image.open(path);rgba=np.asarray(im);alpha=rgba[:,:,3];ys,xs=np.where(alpha>8)
        info.update(size=list(im.size),mode=im.mode,fyld_pct=round(100*max(xs.max()-xs.min()+1,ys.max()-ys.min()+1)/max(im.size),2),top_pct=round(100*ys.min()/im.height,2))
        if a['toenbar']:
            assert np.all(rgba[:,:,:3]==255),a['id']
            info.update(alpha_min=int(alpha.min()),alpha_max=int(alpha.max()),hvid_rgb=True)
        if a['id']=='baggrunde/taage':assert alpha.min()>=51 and alpha.max()<=217
        if a['id']=='baggrunde/klyngesloer':
            assert max(alpha[:64].max(),alpha[-64:].max(),alpha[:,:64].max(),alpha[:,-64:].max())==0
        if a['familie']=='silhuetter':
            assert max(alpha[:16].max(),alpha[-16:].max(),alpha[:,:16].max(),alpha[:,-16:].max())==0
            assert alpha.max()==255
    report.append(info)
old=json.loads((ROOT/'kilder/stjernekort/runde-03/kvalitetsrapport.json').read_text(encoding='utf8'))['assets']
now={a['id']:a for a in report}
changed=[a['id'] for a in old if a['id'] in now and a['sha256']!=now[a['id']]['sha256']]
assert set(changed)<= {'glyffer/slot-vaaben'},changed
(HERE/'kvalitetsrapport.json').write_text(json.dumps({'assets':report,'aendrede_fra_runde_03':changed},indent=2),encoding='utf8')
result=subprocess.run(['node','tools/tjek-assets.mjs'],cwd=ROOT,capture_output=True,text=True,encoding='utf8')
(HERE/'asset-tjek.txt').write_text(result.stdout+result.stderr+'\nExitkode: '+str(result.returncode)+'\n',encoding='utf8')
canvas=Image.new('RGB',(1600,2080),'#0A0D24');d=ImageDraw.Draw(canvas)
d.text((40,28),'STJERNEKORT / RUNDE 04',font=font(36,True),fill='#F2EAD8')
d.text((40,84),'Stat-noder · Bygninger · Druide og skovbrug · Emblemer · Stemningslag',font=font(22),fill='#9AA2C8')
families=[('STAT-NODER',['stat-noder'],140),('BYGNINGER',['bygninger'],410),('DRUIDE OG SKOVBRUG',['druide','skovbrug'],680),('OTTE FÆLLES MEDALJONER',['emblemer'],950)]
for title,fs,y in families:
    d.rounded_rectangle((24,y,1576,y+254),radius=12,fill='#121735')
    d.text((42,y+14),title,font=font(21,True),fill='#9AA2C8')
    assets=[a for a in M['assets'] if a['familie'] in fs and (THEME/(a['id']+'.png')).exists()]
    width=1510/max(1,len(assets))
    for j,a in enumerate(assets):
        x=42+j*width;im=Image.open(THEME/(a['id']+'.png'))
        n=136 if fs==['emblemer'] else 170
        paste(canvas,im,x+(width-n)/2,y+48,n)
        d.text((x+12,y+224),a['id'].split('/')[1],font=font(16),fill='#F2EAD8')
from importlib.machinery import SourceFileLoader
lag=SourceFileLoader('lag',str(HERE/'lag-kontaktark.py')).load_module()
d.text((40,1240),'TONBARE LAG / TEMAETS FARVER',font=font(23,True),fill='#9AA2C8')
for j,(id,color,opacity) in enumerate([('taage','#B9C0E6',.85),('nebula','#5B3FA8',.45),('klyngesloer','#A78BFA',.18)]):
    x=40+j*520;tile=lag.toned('baggrunde/'+id,color,opacity)
    if id!='klyngesloer':
        # A true 3x3 square, shown with the configured tint and opacity.
        tiled=Image.new('RGBA',(768,768))
        for yy in range(3):
            for xx in range(3):
                small=tile.resize((256,256),Image.Resampling.LANCZOS)
                tiled.alpha_composite(small,(xx*256,yy*256))
        paste(canvas,tiled,x+54,1290,340)
    else:paste(canvas,tile,x+54,1290,340)
    d.text((x+24,1644),id+(' · 3 × 3' if id!='klyngesloer' else ''),font=font(19),fill='#F2EAD8')
d.text((40,1695),'FJERNE LANDMÆRKER / OPACITET 0,25',font=font(23,True),fill='#9AA2C8')
for j,a in enumerate([a for a in M['assets'] if a['familie']=='silhuetter' and (THEME/(a['id']+'.png')).exists()]):
    x=40+j*390;paste(canvas,lag.toned(a['id'],'#C9C6EE',.25),x+40,1735,240)
    d.text((x+40,1972),a['id'].split('/')[1],font=font(18),fill='#F2EAD8')
d.text((40,2020),str(len(report))+' / 106 assets leveret · Kontaktark viser også små størrelser og gråtoner',font=font(24,True),fill='#6DD58C')
canvas.save(HERE/'oversigt.png',optimize=True)
print(result.stdout)

