from efterbehandling import *
sources=json.loads((HERE/'kilder.json').read_text(encoding='utf8'))
for s in sources:
    id=s['id'];src=Path(s['source'])
    original=ORIG/(id+'.png');original.parent.mkdir(parents=True,exist_ok=True)
    Image.open(src).resize((1024,1024),Image.Resampling.LANCZOS).save(original)
    if id.startswith('noder/'):
        export(src,id,256,.76)
    elif id=='baggrunde/portraet':
        im=Image.open(src).convert('RGB').resize((512,512),Image.Resampling.LANCZOS)
        # Guarantee horizontal mirror symmetry for the common portrait plate.
        im=Image.blend(im,im.transpose(Image.Transpose.FLIP_LEFT_RIGHT),.5)
        dest=THEME/(id+'.jpg');backup(dest);im.save(dest,quality=90,subsampling=0)
    elif id=='emblemer/traefaeldning':
        from PIL import ImageDraw
        im=clean(Image.open(src))
        # Align the rim to the requested mathematical disk, independent of source speckles.
        im=im.resize((230,230),Image.Resampling.LANCZOS)
        luminance=np.asarray(im.convert('L'),dtype=float)/255
        theme=json.loads((THEME/'tema.json').read_text(encoding='utf8'))
        color=theme['farver']['klynger']['traefaeldning'].lstrip('#')
        mid=np.array([int(color[i:i+2],16) for i in (0,2,4)])
        dark=mid*.25;light=mid*.4+255*.6
        result=np.empty((*luminance.shape,3))
        for c in range(3):result[:,:,c]=np.interp(luminance,[0,.5,1],[dark[c],mid[c],light[c]])
        tile=Image.fromarray(np.uint8(np.clip(result,0,255))).convert('RGBA')
        canvas=Image.new('RGBA',(256,256));canvas.paste(tile,(13,13))
        mask=Image.new('L',(1024,1024));ImageDraw.Draw(mask).ellipse((52,52,971,971),fill=255)
        canvas.putalpha(mask.resize((256,256),Image.Resampling.LANCZOS))
        dest=THEME/(id+'.png');backup(dest);bleed(canvas).save(dest,optimize=True)
print(f'{len(sources)} genereringer arkiveret og eksporteret')
