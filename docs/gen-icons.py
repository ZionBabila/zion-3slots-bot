#!/usr/bin/env python3
"""Generate simple PNG icons for the PWA manifest."""
import struct, zlib, math

def png(size, bg, fg):
    """Create a minimal PNG with a lightning bolt icon."""
    w = h = size
    raw = []
    cx, cy = w//2, h//2
    r = min(w,h)//2 - 4
    for y in range(h):
        row = b'\x00'
        for x in range(w):
            dx, dy = x - cx, y - cy
            dist = math.sqrt(dx*dx + dy*dy)
            # Circle background
            if dist < r:
                # Lightning bolt shape
                in_bolt = False
                nx = (x - cx) / r
                ny = (y - cy) / r
                # Simple bolt: upper right to lower left
                if -0.15 < nx + ny*0.3 < 0.45 and -0.7 < ny < 0.7:
                    if ny < 0 and -0.1 < nx < 0.45:
                        in_bolt = True
                    elif ny >= 0 and -0.45 < nx < 0.1:
                        in_bolt = True
                if in_bolt:
                    row += fg
                else:
                    row += bg
            else:
                row += b'\x00\x00\x00\x00'
        raw.append(row)

    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    raw_bytes = b''.join(raw)
    idat = zlib.compress(raw_bytes)

    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')

bg = b'\x7c\x3a\xed\xff'  # purple
fg = b'\xff\xff\xff\xff'  # white

with open('icons/icon-192.png', 'wb') as f:
    f.write(png(192, bg, fg))
with open('icons/icon-512.png', 'wb') as f:
    f.write(png(512, bg, fg))

print("Icons generated.")
