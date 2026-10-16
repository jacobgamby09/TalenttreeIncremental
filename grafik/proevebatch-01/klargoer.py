"""Package the eight commissioned sample assets. Originals remain untouched."""
from pathlib import Path
import json, math, colorsys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
THEME = ROOT / 'temaer/stjernekort'
specs = json.loads((HERE / 'prompts.json').read_text(encoding='utf-8'))['assets']
manifest = json.loads((ROOT / 'temaer/asset-manifest.json').read_text(encoding='utf-8'))
entries = {a['id']: a for a in manifest['assets']}
report = []
for s in specs:
    a = entries[s['id']]
    out = THEME / (s['id'] + '.png')
    if out.exists():
        raise FileExistsError(out)
    im = Image.open(s['source']).convert('RGBA')
    assert im.getchannel('A').getextrema()[0] == 0, s['id']
    crop = im.crop(im.getchannel('A').getbbox())
    size = a['bredde']
    fraction = .76 if s['id'].startswith('noder/') else .88 if s['id'].startswith('ressourcer/') else .80 if s['id'].startswith('portraetter/') else .90
    crop.thumbnail((round(size * fraction), round(size * fraction)), Image.Resampling.LANCZOS)
    # The manifest explicitly requests matching the emblem hue to the theme.
    if s['id'].startswith('emblemer/'):
        arr = np.array(crop)
        target_hue = colorsys.rgb_to_hsv(109/255, 213/255, 140/255)[0]
        hsv = np.array(crop.convert('RGB').convert('HSV'))
        hsv[..., 0] = round(target_hue * 255)
        corrected = Image.fromarray(hsv, 'HSV').convert('RGB')
        corrected.putalpha(crop.getchannel('A'))
        crop = corrected
    canvas = Image.new('RGBA', (size, size))
    canvas.alpha_composite(crop, ((size-crop.width)//2, (size-crop.height)//2))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, optimize=True)
    report.append({'id':s['id'], 'size':[size,size], 'bytes':out.stat().st_size, 'alpha_extrema':canvas.getchannel('A').getextrema()})

# Periodic Fourier dust and wraparound star kernels: no painted seam to repair.
N = 2048
rng = np.random.default_rng(16102026)
y, x = np.mgrid[0:N,0:N].astype(np.float32)
field = np.zeros((N,N), dtype=np.float32)
for _ in range(22):
    kx, ky = rng.integers(-5,6,2)
    if kx == ky == 0: continue
    field += np.cos(2*np.pi*(kx*x+ky*y)/N + rng.uniform(0,2*np.pi)) / (1+kx*kx+ky*ky)
field /= max(float(np.max(np.abs(field))), .01)
rgb = np.empty((N,N,3), dtype=np.float32)
rgb[:] = (10,13,36)
rgb += field[...,None] * np.array([2.5,2,5.5])
for _ in range(2500):
    sx, sy = rng.integers(0,N,2)
    bright = rng.uniform(14,70) if rng.random() < .97 else rng.uniform(75,140)
    sigma = rng.uniform(.38,.9)
    radius = 4
    dy, dx = np.mgrid[-radius:radius+1,-radius:radius+1]
    kernel = np.exp(-(dx*dx+dy*dy)/(2*sigma*sigma)) * bright
    tint = np.array([(1.,.94,.83),(.77,.87,1.),(.95,.96,1.)][rng.integers(0,3)])
    rgb[(sy+dy)%N,(sx+dx)%N] += kernel[...,None] * tint
rgb += rng.uniform(-.5,.5,(N,N,1))
sky = Image.fromarray(np.clip(np.rint(rgb),0,255).astype('uint8'))
sky_path = THEME / 'baggrunde/stjernehimmel.jpg'
if sky_path.exists(): raise FileExistsError(sky_path)
sky_path.parent.mkdir(parents=True,exist_ok=True)
sky.save(sky_path,quality=90,subsampling=0)

# Check the actual JPEG, since the supplied validator only checks PNG seams.
arr = np.asarray(Image.open(sky_path)).astype(float)
seam_x = float(np.abs(arr[:,-1]-arr[:,0]).mean())
seam_y = float(np.abs(arr[-1]-arr[0]).mean())
inner_x = float(np.abs(arr[:,1:]-arr[:,:-1]).mean())
inner_y = float(np.abs(arr[1:]-arr[:-1]).mean())
assert seam_x < 2.5*inner_x+2 and seam_y < 2.5*inner_y+2
report.append({'id':'baggrunde/stjernehimmel','size':[N,N],'bytes':sky_path.stat().st_size,'seed':16102026,'seam_x':seam_x,'seam_y':seam_y,'inner_x':inner_x,'inner_y':inner_y})
(HERE/'teknisk-tjek.json').write_text(json.dumps(report,indent=2),encoding='utf-8')

# 3x3 repeat proof and a comparison board, not game UI.
small = sky.resize((512,512),Image.Resampling.LANCZOS)
repeat = Image.new('RGB',(1536,1536))
for row in range(3):
    for col in range(3): repeat.paste(small,(col*512,row*512))
repeat.save(HERE/'stjernehimmel-3x3.jpg',quality=92)

def font(n, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'), n)

board = Image.new('RGB',(1600,1060),'#0A0D24')
d = ImageDraw.Draw(board)
d.text((48,26),'TALENTTREE / STJERNEKORT',font=font(31,True),fill='#F2EAD8')
d.text((48,72),'PRØVEBATCH 01   ·   8 assets   ·   Stilprøve til vurdering',font=font(19),fill='#9AA2C8')
labels = ['Eg','Kobberbrystplade','Kobberbarre','Hængelås','Spiller','Ulv','Træfældning','Stjernehimmel']
ids = ['noder/eg','noder/kobberbrystplade','ressourcer/kobberbarre','glyffer/laas','portraetter/spiller','portraetter/ulv','emblemer/traefaeldning','baggrunde/stjernehimmel']

def lock_preview():
    # Same geometry as laas.svg, rasterized only for this comparison sheet.
    scale=4
    im=Image.new('RGBA',(128*scale,128*scale))
    dr=ImageDraw.Draw(im)
    dr.arc((36*scale,10*scale,92*scale,66*scale),180,360,fill='white',width=12*scale)
    dr.rectangle((36*scale,38*scale,48*scale,58*scale),fill='white')
    dr.rectangle((80*scale,38*scale,92*scale,58*scale),fill='white')
    dr.rounded_rectangle((20*scale,54*scale,108*scale,118*scale),radius=10*scale,fill='white')
    dr.ellipse((55*scale,72*scale,73*scale,90*scale),fill=(0,0,0,0))
    dr.rectangle((59*scale,81*scale,69*scale,101*scale),fill=(0,0,0,0))
    return im.resize((128,128),Image.Resampling.LANCZOS)

for i, (label, asset_id) in enumerate(zip(labels,ids)):
    left=40+(i%4)*390
    top=124+(i//4)*438
    d.rounded_rectangle((left,top,left+370,top+418),radius=14,fill='#121735',outline='#2B3366',width=1)
    d.text((left+20,top+15),label,font=font(23,True),fill='#F2EAD8')
    a=entries[asset_id]
    image = lock_preview() if asset_id=='glyffer/laas' else Image.open(THEME/(asset_id+'.'+a['format'])).convert('RGBA')
    preview=image.copy()
    preview.thumbnail((250,250),Image.Resampling.LANCZOS)
    if asset_id=='glyffer/laas': preview=preview.resize((190,190),Image.Resampling.LANCZOS)
    if asset_id=='ressourcer/kobberbarre': preview=preview.resize((210,210),Image.Resampling.LANCZOS)
    board.paste(preview,(left+(370-preview.width)//2,top+56+(250-preview.height)//2),preview)
    if asset_id=='baggrunde/stjernehimmel':
        d.text((left+20,top+334),'2048 × 2048 · sømløs JPG',font=font(17),fill='#9AA2C8')
    else:
        sizes=[64,32] if i in [0,1,4,5] else [32,16] if i==2 else [32,24]
        xpos=left+22
        for sz in sizes:
            thumb=image.resize((sz,sz),Image.Resampling.LANCZOS)
            board.paste(thumb,(xpos,top+320),thumb)
            d.text((xpos,top+386),str(sz)+' px',font=font(14),fill='#9AA2C8')
            xpos+=100
        d.text((left+208,top+388),f"{a['bredde']} × {a['hoejde']} · {a['format'].upper()}",font=font(14),fill='#9AA2C8')
d.text((48,1024),'Transparent grafik · samme lysretning · ingen indbygget tekst eller UI',font=font(17),fill='#9AA2C8')
board.save(HERE/'oversigt.png',optimize=True)
print(json.dumps(report,indent=2))
