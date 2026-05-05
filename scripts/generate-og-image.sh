#!/usr/bin/env bash
#
# Regenerate src/og-image.png — the 1200x630 social-preview image referenced by
# og:image and twitter:image. Runs once-off; not part of the build. Re-run after
# tweaking layout/tagline.
#
# Requires ImageMagick (`brew install imagemagick`). Uses macOS system Arial.
set -euo pipefail

cd "$(dirname "$0")/.."

ICON="src/android-chrome-512x512.png"
OUT="src/og-image.png"
FONT_BOLD="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG="/System/Library/Fonts/Supplemental/Arial.ttf"

BG="#080808"
ACCENT="#4488BB"
SUBTLE="#bdbdbd"

magick -size 1200x630 "xc:${BG}" \
  \( "${ICON}" -resize 360x360 \) -geometry +120+135 -composite \
  -font "${FONT_BOLD}" -pointsize 110 -fill white -gravity NorthWest \
    -annotate +540+185 "TypeFast.io" \
  -font "${FONT_REG}" -pointsize 40 -fill "${SUBTLE}" \
    -annotate +540+320 "Test your typing speed." \
  -font "${FONT_REG}" -pointsize 28 -fill "${ACCENT}" \
    -annotate +540+400 "WPM  •  accuracy  •  18+ languages" \
  "${OUT}"

echo "Wrote ${OUT}"
