import os, struct, zlib, math

def create_png(width, height, pixels_rgba):
    """Create a minimal valid PNG (RGBA) from list of (r,g,b,a) tuples."""
    def make_chunk(tag, data):
        c = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", c)

    # IHDR: width, height, bit_depth=8, color_type=6(RGBA), compression=0, filter=0, interlace=0
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    raw_rows = b""
    for y in range(height):
        raw_rows += b"\x00"  # no filter
        for x in range(width):
            r, g, b, a = pixels_rgba[y * width + x]
            raw_rows += bytes([r & 0xff, g & 0xff, b & 0xff, a & 0xff])

    idat_data = zlib.compress(raw_rows, 6)

    return (
        b"\x89PNG\r\n\x1a\n"
        + make_chunk(b"IHDR", ihdr_data)
        + make_chunk(b"IDAT", idat_data)
        + make_chunk(b"IEND", b"")
    )

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def make_icon(size):
    pixels = []
    cx, cy = size / 2.0, size / 2.0
    # Gradient colours: #118AB2 -> #06D6A0
    c1 = (17, 138, 178)
    c2 = (6, 214, 160)
    stroke = max(2, size // 14)

    nx1 = int(size * 0.28)
    nx2 = int(size * 0.72)
    ny1 = int(size * 0.22)
    ny2 = int(size * 0.78)

    for y in range(size):
        for x in range(size):
            dx = x - cx
            dy = y - cy
            # Squircle mask (rounded square)
            rx = abs(dx) / (size * 0.48)
            ry = abs(dy) / (size * 0.48)
            in_shape = (rx ** 3.5 + ry ** 3.5) < 1.0

            if in_shape:
                t = (x + y) / (2.0 * size)
                bg = lerp_color(c1, c2, t)

                # Draw "N" letter
                is_letter = False
                # Left vertical bar
                if nx1 <= x <= nx1 + stroke and ny1 <= y <= ny2:
                    is_letter = True
                # Right vertical bar
                if nx2 - stroke <= x <= nx2 and ny1 <= y <= ny2:
                    is_letter = True
                # Diagonal
                if ny2 > ny1:
                    progress = (y - ny1) / float(ny2 - ny1)
                    diag_x = nx1 + progress * (nx2 - nx1)
                    if abs(x - diag_x) <= stroke and ny1 <= y <= ny2:
                        is_letter = True

                if is_letter:
                    pixels.append((255, 255, 255, 255))
                else:
                    pixels.append((bg[0], bg[1], bg[2], 255))
            else:
                pixels.append((0, 0, 0, 0))

    return pixels

out_dir = r"d:\Neura-Learn-1\frontend\public\icons"
os.makedirs(out_dir, exist_ok=True)

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for size in sizes:
    print(f"Generating {size}x{size}...", flush=True)
    pixels = make_icon(size)
    png_data = create_png(size, size, pixels)
    fpath = os.path.join(out_dir, f"icon-{size}x{size}.png")
    with open(fpath, "wb") as f:
        f.write(png_data)
    print(f"  -> {fpath} ({len(png_data):,} bytes)")

print("Done!")
