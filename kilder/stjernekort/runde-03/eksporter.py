from efterbehandling import *
from scipy.ndimage import binary_fill_holes
from rembg import remove,new_session
import hashlib

M=json.loads((ROOT/'temaer/asset-manifest.json').read_text(encoding='utf8'))
assets={a['id']:a for a in M['assets']}
session=None

def segment(src,dest):
    global session
    if dest.exists():return dest
    if session is None:session=new_session('birefnet-general-lite',providers=['CPUExecutionProvider'])
    im=Image.open(src).convert('RGB')
    mask=remove(im,session=session,only_mask=True).convert('L')
    a=np.array(mask)
    solid=a>220
    holes=binary_fill_holes(solid)&~solid
    # Restore holes within dark subject matter without filling real grey gaps between branches.
    rgb=np.array(im).astype(float)
    labs,n=label(holes)
    for i in range(1,n+1):
        region=labs==i
        if np.median(np.max(np.abs(rgb[region]-np.array([107,107,115])),axis=1))>35:a[region]=255
    a[a>240]=255;a[a<=8]=0
    # Decontaminate anti-aliased boundary colours using the nearest opaque foreground.
    _,idx=distance_transform_edt(a<250,return_indices=True)
    edge=(a>0)&(a<250)
    rgb[edge]=rgb[tuple(idx[:,edge])]
    out=Image.fromarray(np.dstack([rgb.astype('uint8'),a]))
    dest.parent.mkdir(parents=True,exist_ok=True);out.save(dest)
    return dest

def portrait(src,id):
    im=clean(Image.open(src)); w,h=im.size
    if id=='portraetter/spiller':
        # Enlarge the approved cutout; top 13%, eye line 39%. The cloak is cropped at bottom.
        factor=.50; y=66
    elif id=='portraetter/ulv':
        factor=min(500/w,472/h); y=512-round(h*factor)
    else:
        # Bottom-cropped originals retain their framing: top at 14%, no side contact.
        factor=min(476/w,440/h); y=512-round(h*factor)
    im=im.convert('RGBa').resize((round(w*factor),round(h*factor)),Image.Resampling.LANCZOS).convert('RGBA')
    out=Image.new('RGBA',(512,512));out.alpha_composite(im,((512-im.width)//2,y))
    dest=THEME/(id+'.png');backup(dest);dest.parent.mkdir(parents=True,exist_ok=True)
    bleed(out).save(dest,optimize=True)

def main():
    sources=json.loads((HERE/'kilder.json').read_text(encoding='utf8'))
    extra=HERE/'ekstra-kilder.json'
    if extra.exists():sources+=json.loads(extra.read_text(encoding='utf8'))
    for filename in ['portraet-rettelser.json','portraet-slutrettelser.json']:
        p=HERE/filename
        if p.exists():sources+=json.loads(p.read_text(encoding='utf8'))
    sources=list({entry['id']:entry for entry in sources}.values())
    for entry in sources:
        id=entry['id'];src=Path(entry['source']); a=assets[id]
        original=ORIG/(id+'.png');original.parent.mkdir(parents=True,exist_ok=True)
        if original.exists() and id in ['noder/kobbermalm','noder/jernmalm','noder/dyb-aare','portraetter/ulv']:
            saved=HERE/'tidligere-originaler'/(id+'.png');saved.parent.mkdir(parents=True,exist_ok=True)
            if not saved.exists():shutil.copy2(original,saved)
        Image.open(src).resize((1024,1024),Image.Resampling.LANCZOS).save(original)
        if a['familie']=='portraetter':
            tag=hashlib.sha256(original.read_bytes()).hexdigest()[:10]
            cut=segment(original,HERE/'segmenterede'/(id.split('/')[1]+'-'+tag+'.png'))
            if a.get('kant_tilladt'):portrait(cut,id)
            else:export(cut,id,512,.80)
        else:export(original,id,a['bredde'],.84 if a['familie']=='ressourcer' else .76)
        print(id,flush=True)
    portrait(ORIG/'portraetter/spiller.png','portraetter/spiller')

if __name__=='__main__':main()
