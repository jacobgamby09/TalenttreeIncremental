from pathlib import Path
import json, shutil, sys
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, label

ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
THEME=ROOT/'temaer/stjernekort'
ORIG=ROOT/'kilder/stjernekort/originaler'

def backup(path):
    if path.exists():
        dst=HERE/'foer-rettelser'/path.relative_to(THEME)
        dst.parent.mkdir(parents=True,exist_ok=True)
        if not dst.exists(): shutil.copy2(path,dst)

def bleed(im):
    a=np.array(im)
    visible=a[:,:,3]>8
    if not visible.any(): raise ValueError('Empty alpha')
    distance,indices=distance_transform_edt(~visible,return_indices=True)
    a[:,:,:3][~visible]=a[:,:,:3][tuple(indices[:,~visible])]
    # Eight pixels of hidden colour are sufficient for filtering; the remaining
    # fully transparent canvas stays zero to keep PNG downloads compact.
    a[:,:,:3][(a[:,:,3]==0)&(distance>8)]=0
    return Image.fromarray(a)

def clean(im):
    a=np.array(im.convert('RGBA'))
    a[:,:,3][a[:,:,3]<=8]=0
    # Reject disconnected faint flecks, retaining leaves/twigs that belong to the motif.
    labs,n=label(a[:,:,3]>0)
    counts=np.bincount(labs.ravel())
    for i in range(1,n+1):
        mask=labs==i
        if counts[i]<5 and np.max(a[:,:,3][mask])<96: a[:,:,3][mask]=0
    im=Image.fromarray(a)
    return bleed(im.crop(im.getchannel('A').getbbox()))

def export(source,asset_id,size,fraction,bust=False):
    im=clean(Image.open(source))
    if bust:
        # Cut within the existing shoulders, rather than exposing the bottom of the cutout.
        im=im.crop((0,0,im.width,round(im.height*.85)))
    factor=round(size*fraction)/max(im.size)
    im=im.convert('RGBa').resize((round(im.width*factor),round(im.height*factor)),Image.Resampling.LANCZOS).convert('RGBA')
    im=clean(im)
    out=Image.new('RGBA',(size,size))
    out.alpha_composite(im,((size-im.width)//2,size-im.height if bust else (size-im.height)//2))
    out=bleed(out)
    dest=THEME/(asset_id+'.png')
    backup(dest);dest.parent.mkdir(parents=True,exist_ok=True)
    out.save(dest,optimize=True)
    return out

