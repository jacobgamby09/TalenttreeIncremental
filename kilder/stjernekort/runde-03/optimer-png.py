from efterbehandling import *
import zopfli.png,io
path=THEME/'portraetter/traeets-vogter.png'
original=path.read_bytes()
compressed=zopfli.png.optimize(original,lossy_transparent=False,lossy_8bit=False,num_iterations=15,num_iterations_large=10)
assert compressed[24]==8 and compressed[25]==6,'Keep 8-bit RGBA'
assert np.array_equal(np.array(Image.open(io.BytesIO(original))),np.array(Image.open(io.BytesIO(compressed)))),'Lossless pixels required'
if len(compressed)<len(original):path.write_bytes(compressed)
print(f'Boss: {len(original)} -> {len(path.read_bytes())} bytes, identical RGBA pixels')
