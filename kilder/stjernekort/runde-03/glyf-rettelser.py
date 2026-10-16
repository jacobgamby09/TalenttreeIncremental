from efterbehandling import *
source=(ROOT/'kilder/stjernekort/runde-02/glyffer.py').read_text(encoding='utf8')
exec(source.split("outdir=HERE/")[0])

# Keep the common sword vocabulary, enlarge to the full diagonal field.
blade=unary_union([poly([(64,16),(84,36),(84,72),(44,72),(44,36)]),rect(24,72,80,16),rect(56,80,16,24),rect(48,100,32,12)])
g['slot-vaaben']=outline(blade)
attack=rotate(blade,45)
x0,y0,x1,y1=attack.bounds
attack=scale(attack,108/max(x1-x0,y1-y0),origin=attack.centroid)
g['atk']=move(attack,64-attack.centroid.x,64-attack.centroid.y)
x0,y0,x1,y1=g['atk'].bounds
g['atk']=move(g['atk'],10-x0,10-y0)

# Separate pauldrons and a tapered cuirass with a raised centre ridge.
cuirass=rounded(poly([(40,32),(56,40),(72,40),(88,32),(96,64),(88,104),(64,112),(40,104),(32,64)]))
pauldron=rounded(poly([(20,16),(44,16),(40,40),(32,56),(16,48)]))
g['slot-bryst']=unary_union([outline(cuirass),rect(60,48,8,56,0),pauldron,affinity.scale(pauldron,-1,1,origin=(64,64))])

# Broad hexagonal knee plates and shin armour narrowing to the ankle.
knee=rounded(poly([(24,16),(48,16),(56,28),(48,40),(24,40),(16,28)]))
shin=rounded(poly([(16,48),(56,48),(48,108),(24,112)]))
greave=unary_union([outline(shin),knee])
g['slot-ben']=unary_union([greave,move(greave,56,0)])

# Five radial masonry blocks: angled joints and projecting keystone.
arch=circle(64,64,48).difference(circle(64,64,24)).intersection(box(0,0,128,64))
for deg in [36,72,108,144]:
    t=math.radians(deg)
    cut=LineString([(64+18*math.cos(t),64-18*math.sin(t)),(64+60*math.cos(t),64-60*math.sin(t))]).buffer(5,cap_style=2)
    arch=arch.difference(cut)
key=poly([(54,10),(74,10),(70,40),(58,40)])
arch=arch.difference(box(50,0,78,45)).union(key)
g['dungeon']=unary_union([arch,rect(16,66,24,20),rect(16,96,24,22),rect(88,66,24,20),rect(88,96,24,22)])

# Long curved horns with round roots; no triangular cat-ear silhouette.
boss=move(scale(skull,.72),0,18)
horn=silhouette((42,65),[((17,64),(8,33),(16,10)),((18,35),(34,37),(47,42)),((51,49),(49,59),(42,65))])
g['boss']=unary_union([boss,horn,affinity.scale(horn,-1,1,origin=(64,64))])
g={name:g[name] for name in ['atk','slot-vaaben','slot-bryst','slot-ben','dungeon','boss']}
exec("outdir=HERE/"+source.split("outdir=HERE/",1)[1])
