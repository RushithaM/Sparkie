# Slice the generated cat reference sheet into avatar-pack sprite strips.
# Usage: python3 scripts/slice_sheet.py assets/reference/cat-sheet.png
# Detects sprite cells (row bands then column gaps), keys out the dark
# background, normalizes each pose onto a 256x256 bottom-anchored frame,
# and writes strips + updates nothing else (manifest is hand-maintained).
import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / 'assets/avatars/cat'
FRAME = 256
MARGIN = 12

# row-major cell index -> (animation, frame order). Matches the reference sheet layout:
# row1: Idle1 Idle2 LookAround Blink | Walk1 Walk2 Walk3
# row2: Sit SitHappy LyingDown Sleeping | Happy Excited Thinking Sad
# row3: Waving PawUp Jump Stretch | Happy2 Curious Sad2 Angry
MAPPING = {
    'idle': [0, 0, 0, 0, 0, 0, 0, 1],  # Idle1 x7 + Idle2(eyes closed) = blink every ~4s at 2fps
    'look-around': [2],
    'blink': [3],
    'walk': [4, 5, 6],
    'sit': [7],
    'happy': [8],               # Sit(Happy) — full-body, consistent crop with the rest
    'sleep': [10],              # Sleeping (ZZZ baked in; LyingDown omitted — breathing effect instead)
    'celebrate': [17],          # Jump (Excited is a bust crop — pops if mixed)
    'thinking': [13],
    'sad': [14],
    'wave': [15, 16],           # Waving + PawUp
    'stretch': [18],
    'curious': [20],
    'angry': [22]
}


def bands(mask, axis, min_size, min_count):
    proj = mask.sum(axis=axis)
    runs, start = [], None
    for i, v in enumerate(proj):
        if v >= min_count and start is None:
            start = i
        elif v < min_count and start is not None:
            if i - start >= min_size:
                runs.append((start, i))
            start = None
    if start is not None and len(proj) - start >= min_size:
        runs.append((start, len(proj)))
    return runs


def key_background(region, bg):
    # Remove only background CONNECTED to the cell border (flood fill), so dark
    # interior details (eyes, nose) that happen to match the bg color survive.
    dist = np.abs(region[:, :, :3] - bg).sum(axis=2)
    bgish = dist < 100
    reach = np.zeros_like(bgish)
    reach[0, :], reach[-1, :] = bgish[0, :], bgish[-1, :]
    reach[:, 0] |= bgish[:, 0]
    reach[:, -1] |= bgish[:, -1]
    while True:
        grown = reach.copy()
        grown[1:, :] |= reach[:-1, :]
        grown[:-1, :] |= reach[1:, :]
        grown[:, 1:] |= reach[:, :-1]
        grown[:, :-1] |= reach[:, 1:]
        grown &= bgish
        if (grown == reach).all():
            break
        reach = grown
    alpha = np.where(reach, 0, 255).astype(float)
    pad = np.pad(alpha, 1, mode='edge')  # 3x3 blur = 1px soft edge
    alpha = sum(
        pad[dy : dy + alpha.shape[0], dx : dx + alpha.shape[1]] for dy in range(3) for dx in range(3)
    ) / 9
    return alpha


def main(sheet_path):
    img = Image.open(sheet_path).convert('RGBA')
    px = np.asarray(img).astype(int)
    bg = px[2, 2, :3]
    dist = np.abs(px[:, :, :3] - bg).sum(axis=2)
    mask = dist > 90

    cells = []
    for y0, y1 in bands(mask, axis=1, min_size=100, min_count=8):  # tall rows = cats, not labels
        for x0, x1 in bands(mask[y0:y1], axis=0, min_size=40, min_count=4):
            cells.append((x0, y0, x1, y1))
    print(f'{len(cells)} cells detected')

    sprites = []
    for x0, y0, x1, y1 in cells:
        region = px[y0:y1, x0:x1]
        rgba = region.copy()
        rgba[:, :, 3] = key_background(region, bg)
        sprite = Image.fromarray(rgba.astype(np.uint8))
        sprite = sprite.crop(sprite.getbbox())
        scale = min((FRAME - 2 * MARGIN) / sprite.width, (FRAME - 2 * MARGIN) / sprite.height)
        sprite = sprite.resize((max(1, int(sprite.width * scale)), max(1, int(sprite.height * scale))))
        frame = Image.new('RGBA', (FRAME, FRAME), (0, 0, 0, 0))
        frame.paste(sprite, ((FRAME - sprite.width) // 2, FRAME - MARGIN - sprite.height))
        sprites.append(frame)

    OUT.mkdir(parents=True, exist_ok=True)
    for name, idxs in MAPPING.items():
        if max(idxs) >= len(sprites):
            print(f'skip {name}: cell index out of range')
            continue
        strip = Image.new('RGBA', (FRAME * len(idxs), FRAME), (0, 0, 0, 0))
        for i, idx in enumerate(idxs):
            strip.paste(sprites[idx], (i * FRAME, 0))
        strip.save(OUT / f'{name}.png')
        print(f'{name}.png  ({len(idxs)} frames)')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('usage: python3 scripts/slice_sheet.py <sheet.png>')
    main(sys.argv[1])
