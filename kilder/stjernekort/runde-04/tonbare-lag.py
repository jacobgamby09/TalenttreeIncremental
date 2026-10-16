from efterbehandling import *
from scipy.ndimage import gaussian_filter,map_coordinates
N=1024
rng=np.random.default_rng(41026)
y,x=np.mgrid[:N,:N]

def field(scales):
    result=np.zeros((N,N),dtype=float)
    for sigma,weight in scales:
        layer=gaussian_filter(rng.normal(size=(N,N)),sigma,mode='wrap')
        layer/=layer.std()
        result+=layer*weight
    return result

def norm(a):
    return (a-a.min())/(a.max()-a.min())

def save(name,a):
    alpha=np.uint8(np.clip(np.floor(a*255+rng.random(a.shape)),0,255))
    out=np.full((N,N,4),255,dtype=np.uint8);out[:,:,3]=alpha
    p=THEME/'baggrunde'/f'{name}.png';p.parent.mkdir(parents=True,exist_ok=True)
    Image.fromarray(out).save(p,optimize=True)
    original=ORIG/'baggrunde'/f'{name}.png';original.parent.mkdir(parents=True,exist_ok=True)
    Image.fromarray(alpha).save(original,optimize=True)
    return dict(id='baggrunde/'+name,alpha_min=int(alpha.min()),alpha_max=int(alpha.max()),seed=41026,method='periodic Gaussian fBm / wrap-around domain warp')

fog=field([(65,1),(28,.55),(12,.22),(5,.07)])
wx=field([(100,1),(35,.25)])*32;wy=field([(100,1),(35,.25)])*32
fog=map_coordinates(fog,[(y+wy)%N,(x+wx)%N],order=3,mode='grid-wrap')
fog=norm(fog)
records=[save('taage',.20+.65*fog)]
neb=field([(90,1),(50,.6),(30,.15)])
neb=norm(neb)
# Smooth low-density regions and broad cloud masses; preserve the whole alpha range.
neb=np.clip((neb-.24)/.76,0,1)
neb=neb*neb*(3-2*neb)
records.append(save('nebula',neb))
rad=np.sqrt(((x-506)/423)**2+((y-510)/399)**2)
rough=field([(80,1),(30,.25)])
envelope=np.clip(1-rad**2,0,1)**2
cloud=envelope*np.clip(.7+.13*rough,.12,1.2)
# Explicit 64px clear border with a smooth 48px safety transition.
edge=np.minimum.reduce([x,y,N-1-x,N-1-y])
margin=np.clip((edge-64)/48,0,1);margin=margin*margin*(3-2*margin)
records.append(save('klyngesloer',norm(cloud*margin)))
(HERE/'teksturer.json').write_text(json.dumps(records,indent=2),encoding='utf8')
print(json.dumps(records))

