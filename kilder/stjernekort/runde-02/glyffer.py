"""One shared vector vocabulary; export only filled white even-odd paths."""
from pathlib import Path
import math, json
import numpy as np
from PIL import Image,ImageDraw
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
from shapely import affinity
from efterbehandling import ROOT,THEME,HERE,backup

def poly(points): return Polygon(points)
def circle(x,y,r): return Point(x,y).buffer(r,quad_segs=12)
def rect(x,y,w,h,r=4):
    return box(x+r,y+r,x+w-r,y+h-r).buffer(r,quad_segs=5) if r else box(x,y,x+w,y+h)
def curve(start, segments):
    pts=[start]; p=np.array(start,dtype=float)
    for c1,c2,end in segments:
        a,b,c=map(lambda v:np.array(v,dtype=float),(c1,c2,end))
        for t in np.linspace(0,1,17)[1:]: pts.append(tuple((1-t)**3*p+3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3*c))
        p=c
    return pts
def silhouette(start,segments):return poly(curve(start,segments))
def outline(g): return g.difference(g.buffer(-8,join_style=2))
def rounded(g): return g.buffer(-4,join_style=2).buffer(4,quad_segs=5)
def move(g,x=0,y=0):return affinity.translate(g,x,y)
def rotate(g,deg,origin=(64,64)):return affinity.rotate(g,deg,origin=origin)
def scale(g,s,origin=(64,64)):return affinity.scale(g,s,s,origin=origin)

heart=silhouette((64,112),[
 ((54,102),(16,76),(16,46)),((16,16),(48,8),(64,34)),
 ((80,8),(112,16),(112,46)),((112,76),(74,102),(64,112))])
sword=unary_union([poly([(64,16),(80,32),(80,72),(48,72),(48,32)]),rect(32,72,64,12),rect(56,80,16,24),circle(64,104,8)])
skull=silhouette((40,112),[
 ((40,103),(40,97),(32,92)),((12,78),(12,38),(32,24)),
 ((48,10),(80,10),(96,24)),((116,38),(116,78),(96,92)),
 ((88,97),(88,103),(88,112)),((72,112),(56,112),(40,112))])
skull=skull.difference(unary_union([circle(44,64,12),circle(84,64,12),poly([(64,78),(56,94),(72,94)])]))
g={}
g['slot-vaaben']=outline(sword)
helmet=silhouette((24,112),[((24,88),(24,66),(24,52)),((24,4),(104,4),(104,52)),((104,66),(104,88),(104,112)),((80,106),(48,106),(24,112))])
helmet=helmet.difference(poly([(40,56),(88,56),(88,94),(72,88),(72,64),(56,64),(56,88),(40,94)]))
g['slot-hoved']=outline(helmet)
chest=poly([(32,16),(48,16),(52,32),(76,32),(80,16),(96,16),(112,48),(96,56),(96,104),(64,112),(32,104),(32,56),(16,48)])
g['slot-bryst']=outline(rounded(chest))
leg=poly([(24,16),(56,16),(52,64),(48,112),(24,112),(20,64)])
g['slot-ben']=unary_union([outline(rounded(leg)),move(outline(rounded(leg)),52,0)])
boot=poly([(24,24),(64,24),(64,72),(96,80),(112,96),(112,112),(24,112)])
g['slot-foedder']=outline(rounded(boot))
g['socket-bygning']=outline(rounded(poly([(16,56),(64,16),(112,56),(104,64),(104,112),(24,112),(24,64)])))
g['atk']=rotate(sword,45)
g['hp']=heart
shield=silhouette((64,118),[((28,100),(24,64),(24,24)),((48,16),(80,16),(104,24)),((104,64),(100,100),(64,118))])
g['def']=shield.difference(rect(58,32,12,64,0))
hourglass=unary_union([rect(24,10,80,14),rect(24,104,80,14),poly([(32,24),(96,24),(88,48),(72,64),(88,80),(96,104),(32,104),(40,80),(56,64),(40,48)])])
hourglass=hourglass.difference(poly([(44,32),(84,32),(76,46),(52,46)]))
hourglass=hourglass.difference(poly([(44,96),(52,80),(64,72),(76,80),(84,96)]))
g['angrebstid']=hourglass
star=[]
for i in range(10):
    theta=-math.pi/2+i*math.pi/5;r=54 if i%2==0 else 24
    star.append((64+r*math.cos(theta),64+r*math.sin(theta)))
g['xp']=poly(star)
gem=poly([(64,10),(104,64),(64,118),(24,64)])
g['kamppoint']=gem.difference(unary_union([poly([(42,56),(64,30),(86,56),(76,56),(64,42),(52,56)]),poly([(42,72),(64,98),(86,72),(76,72),(64,86),(52,72)])]))
shackle=circle(64,40,28).difference(circle(64,40,16)).intersection(box(0,0,128,56)).union(box(36,40,48,64)).union(box(80,40,92,64))
lock=unary_union([rect(24,56,80,56,4),shackle])
g['laas']=lock.difference(unary_union([circle(64,78,8),rect(59,78,10,22,0)]))
band=LineString(curve((16,36),[ ((32,20),(48,48),(64,36)),((80,24),(88,28),(98,36))])).buffer(7,cap_style=1,quad_segs=5)
g['taage']=unary_union([band,move(band,10,28),move(band,0,56)])
chev=poly([(16,40),(64,10),(112,40),(104,54),(64,30),(24,54)])
g['level']=unary_union([chev,move(chev,0,32),move(chev,0,64)]).intersection(box(10,10,118,118))
g['drab']=skull
boss=move(scale(skull,.85),0,8)
horn=silhouette((40,52),[((16,46),(16,24),(24,10)),((24,30),(40,32),(48,34)),((48,42),(44,48),(40,52))])
g['boss']=unary_union([boss,horn,affinity.scale(horn,-1,1,origin=(64,64))])
branch=LineString(curve((62,112),[((26,104),(12,64),(36,20))])).buffer(4,quad_segs=4)
leaves=[]
for x,y,angle in [(28,34,-20),(20,58,-35),(28,82,-55),(44,100,-65)]:
    leaf=silhouette((x,y-12),[((x-15,y-8),(x-15,y+8),(x,y+12)),((x+15,y+8),(x+15,y-8),(x,y-12))])
    leaves.append(rotate(leaf,angle,(x,y)))
left=unary_union([branch,*leaves])
g['besejret']=scale(unary_union([left,affinity.scale(left,-1,1,origin=(64,64))]),.97)
def sparkle(x,y,r):return poly([(x,y-r),(x+r*.36,y-r*.36),(x+r,y),(x+r*.36,y+r*.36),(x,y+r),(x-r*.36,y+r*.36),(x-r,y),(x-r*.36,y-r*.36)])
g['ny-opdagelse']=unary_union([sparkle(46,80,36),sparkle(82,30,20),sparkle(104,74,14.5)])
arcpts=[(64+44*math.cos(t),64+44*math.sin(t)) for t in np.linspace(math.radians(200),math.radians(340),25)]
arrow=LineString(arcpts).buffer(8,quad_segs=4).union(poly([(114,34),(114,70),(84,52)]))
g['farmingomraade']=unary_union([arrow,rotate(arrow,180)])
arch=circle(64,64,48).difference(circle(64,64,24)).intersection(box(0,0,128,64))
for x in [45,73]:arch=arch.difference(box(x,14,x+10,54))
g['dungeon']=unary_union([arch,rect(16,64,24,20),rect(16,94,24,24),rect(88,64,24,20),rect(88,94,24,24)])
g['kritisk-slag']=unary_union([poly([(16,110),(48,42),(88,10),(56,78)]),poly([(52,118),(84,50),(118,18),(92,86)])])
crack=poly([(59,10),(71,10),(59,38),(76,52),(59,68),(76,84),(59,102),(69,118),(57,118),(47,100),(64,82),(47,66),(64,50),(47,36)])
broken=heart.difference(crack)
parts=list(broken.geoms) if hasattr(broken,'geoms') else [broken]
g['nederlag']=unary_union([move(p,-5 if p.centroid.x<64 else 5,0) for p in parts])
up=poly([(64,40),(88,64),(72,64),(72,88),(56,88),(56,64),(40,64)])
g['helbredelse']=heart.difference(up)
watch=circle(64,70,48).union(rect(52,10,24,14))
ticks=[rect(58,30,12,12,0),rect(92,64,12,12,0),rect(58,98,12,12,0),rect(24,64,12,12,0)]
hand=LineString([(64,70),(84,52)]).buffer(6,cap_style=1,quad_segs=5)
g['varighed']=watch.difference(unary_union([*ticks,hand]))
g['chance']=rect(16,16,96,96).difference(unary_union([circle(40,40,9),circle(64,64,9),circle(88,88,9)]))
g['braendsel']=silhouette((64,118),[((20,118),(12,80),(32,48)),((32,64),(36,68),(42,72)),((48,52),(54,32),(64,10)),((74,32),(80,52),(86,72)),((92,68),(96,64),(96,48)),((116,80),(108,118),(64,118))])
stem=LineString(curve((16,104),[((40,100),(64,20),(112,24))])).buffer(6,cap_style=1,quad_segs=5)
g['torne']=unary_union([stem,poly([(28,92),(18,60),(44,78)]),poly([(50,66),(76,92),(62,52)]),poly([(66,44),(54,14),(80,34)]),poly([(92,28),(114,52),(104,24)])])

def polygons(geom):
    if geom.geom_type=='Polygon':return [geom]
    return [p for p in geom.geoms if p.geom_type=='Polygon']
def pathdata(geom):
    paths=[]
    for p in polygons(geom):
        for ring in [p.exterior,*p.interiors]:
            pts=list(ring.coords)
            paths.append('M'+'L'.join(f'{x:.2f},{y:.2f}' for x,y in pts[:-1])+'Z')
    return ''.join(paths)

outdir=HERE/'glyf-preview';outdir.mkdir(parents=True,exist_ok=True)
for name,geom in g.items():
    assert geom.is_valid,name
    minx,miny,maxx,maxy=geom.bounds
    assert minx>=9 and miny>=9 and maxx<=119 and maxy<=119,(name,geom.bounds)
    path=THEME/f'glyffer/{name}.svg';backup(path);path.parent.mkdir(parents=True,exist_ok=True)
    xml=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#FFFFFF" fill-rule="evenodd" d="{pathdata(geom)}"/></svg>\n'
    assert len(xml.encode())<=8192,(name,len(xml))
    path.write_text(xml,encoding='utf8')
    im=Image.new('RGBA',(512,512));dr=ImageDraw.Draw(im)
    for p in polygons(geom):
        dr.polygon([(x*4,y*4) for x,y in p.exterior.coords],fill='white')
        for ring in p.interiors:dr.polygon([(x*4,y*4) for x,y in ring.coords],fill=(255,255,255,0))
    im.resize((128,128),Image.Resampling.LANCZOS).save(outdir/(name+'.png'))
print(f'{len(g)} SVG-glyffer eksporteret')
