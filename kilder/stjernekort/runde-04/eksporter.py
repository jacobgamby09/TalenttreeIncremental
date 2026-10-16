from efterbehandling import *
from PIL import ImageDraw

def run():
    sources=json.loads((HERE/'kilder.json').read_text(encoding='utf8'))
    fixes=HERE/'rettelser.json'
    if fixes.exists():
        overrides={s['id']:s for s in json.loads(fixes.read_text(encoding='utf8'))}
        sources=[overrides.get(s['id'],s) for s in sources]
    colors=json.loads((THEME/'tema.json').read_text(encoding='utf8'))['farver']['klynger']
    for s in sources:
        if 'source' not in s: continue
        id=s['id'];src=Path(s['source'])
        original=ORIG/(id+'.png');original.parent.mkdir(parents=True,exist_ok=True)
        im=Image.open(src).convert('RGBA')
        im=im.convert('RGBa').resize((1024,1024),Image.Resampling.LANCZOS).convert('RGBA')
        im.save(original,optimize=True)
        if id.startswith('noder/'):
            export(src,id,256,.76)
        elif id.startswith('emblemer/'):
            im=clean(im).resize((230,230),Image.Resampling.LANCZOS)
            lum=np.asarray(im.convert('L'),dtype=float)/255
            color=colors[id.split('/')[1]].lstrip('#')
            mid=np.array([int(color[i:i+2],16) for i in (0,2,4)])
            dark=mid*.25;light=mid*.4+255*.6
            result=np.empty((*lum.shape,3))
            for c in range(3):result[:,:,c]=np.interp(lum,[0,.5,1],[dark[c],mid[c],light[c]])
            tile=Image.fromarray(np.uint8(np.clip(result,0,255))).convert('RGBA')
            canvas=Image.new('RGBA',(256,256));canvas.paste(tile,(13,13))
            mask=Image.new('L',(1024,1024));ImageDraw.Draw(mask).ellipse((52,52,971,971),fill=255)
            canvas.putalpha(mask.resize((256,256),Image.Resampling.LANCZOS))
            dest=THEME/(id+'.png');dest.parent.mkdir(parents=True,exist_ok=True);bleed(canvas).save(dest,optimize=True)
        elif id.startswith('silhuetter/'):
            alpha=np.asarray(im.convert('L'),dtype=float)
            alpha=np.maximum(alpha-3,0)
            core=np.percentile(alpha[alpha>24],99.5)
            alpha=np.clip(alpha/core,0,1)
            # Soften the source's lower cut edge before the specified canvas fade.
            rows=np.where((alpha>.03).any(axis=1))[0]
            bottom=int(rows[-1])
            feather=np.clip((bottom-np.arange(1024))/64,0,1)[:,None]
            alpha*=feather*feather*(3-2*feather)
            fade=np.clip((1023-np.arange(1024))/(1024*.25),0,1)[:,None]
            alpha*=fade
            alpha[:16]=0;alpha[-16:]=0;alpha[:,:16]=0;alpha[:,-16:]=0
            out=np.full((1024,1024,4),255,dtype=np.uint8);out[:,:,3]=np.uint8(np.round(alpha*255))
            dest=THEME/(id+'.png');dest.parent.mkdir(parents=True,exist_ok=True)
            Image.fromarray(out).save(dest,optimize=True)
    print(f'{len(sources)} kilder behandlet')

if __name__=='__main__':run()

