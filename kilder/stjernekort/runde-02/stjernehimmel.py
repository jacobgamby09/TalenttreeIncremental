from efterbehandling import *
N=2048
rng=np.random.default_rng(16102026)
y,x=np.mgrid[0:N,0:N].astype(np.float32)
field=np.zeros((N,N),np.float32)
for _ in range(22):
    kx,ky=rng.integers(-5,6,2)
    if kx==ky==0:continue
    field+=np.cos(2*np.pi*(kx*x+ky*y)/N+rng.uniform(0,2*np.pi))/(1+kx*kx+ky*ky)
field/=max(float(np.max(np.abs(field))),.01)
rgb=np.empty((N,N,3),np.float32);rgb[:]=(10,13,36)
# Only 4% of the original dust contrast; same star positions and brightness.
rgb+=field[...,None]*np.array([2.5,2,5.5])*.04
for _ in range(2500):
    sx,sy=rng.integers(0,N,2)
    bright=rng.uniform(14,70) if rng.random()<.97 else rng.uniform(75,140)
    sigma=rng.uniform(.38,.9)
    dy,dx=np.mgrid[-4:5,-4:5]
    kernel=np.exp(-(dx*dx+dy*dy)/(2*sigma*sigma))*bright
    tint=np.array([(1.,.94,.83),(.77,.87,1.),(.95,.96,1.)][rng.integers(0,3)])
    rgb[(sy+dy)%N,(sx+dx)%N]+=kernel[...,None]*tint
rgb+=rng.uniform(-.5,.5,(N,N,1))
im=Image.fromarray(np.clip(np.rint(rgb),0,255).astype('uint8'))
dest=THEME/'baggrunde/stjernehimmel.jpg';backup(dest)
im.save(dest,quality=90,subsampling=0)
small=im.resize((512,512),Image.Resampling.LANCZOS)
repeat=Image.new('RGB',(1536,1536))
for y in range(3):
    for x in range(3):repeat.paste(small,(x*512,y*512))
repeat.save(HERE/'stjernehimmel-3x3.jpg',quality=95)
print('Stoevkontrast reduceret 96%; stjerner bevaret')
