from efterbehandling import *
source=(ROOT/'kilder/stjernekort/runde-02/glyffer.py').read_text(encoding='utf8')
exec(source.split("outdir=HERE/")[0])
# Optical enlargement for the small hollow weapon slot, preserving the sword vocabulary.
blade=unary_union([poly([(64,16),(88,40),(88,72),(40,72),(40,40)]),rect(16,72,96,16),rect(52,80,24,24),rect(44,100,40,12)])
g={'slot-vaaben':outline(blade)}
exec("outdir=HERE/"+source.split("outdir=HERE/",1)[1])

