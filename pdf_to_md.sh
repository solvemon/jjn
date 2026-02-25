#!/usr/bin/env bash
# pdf_to_md.sh — Extracts AAJJ Pensum PDFs to Markdown
# Requires: pdftotext (poppler)
#
# Usage: bash pdf_to_md.sh [GroupName]
#   GroupName defaults to "Senior". Use e.g. "Children" or "Teens" for other groups.
#   PDFs must be in the same folder as this script.
#   Output markdown files are written to a subfolder named after the group.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GROUP="${1:-Senior}"
OUT_DIR="$SCRIPT_DIR/$GROUP"

mkdir -p "$OUT_DIR"

# Friendly name map (filename stem → display title)
declare -A TITLES=(
  ["Basisteknikker"]="AAJJ Ju Jitsu — Basisteknikker (Core Techniques)"
  ["5_Yellow"]="AAJJ Ju Jitsu — 5. Kyu: Yellow Belt"
  ["4_Orange"]="AAJJ Ju Jitsu — 4. Kyu: Orange Belt"
  ["3_Green"]="AAJJ Ju Jitsu — 3. Kyu: Green Belt"
  ["2_Blue"]="AAJJ Ju Jitsu — 2. Kyu: Blue Belt"
  ["1_Brown"]="AAJJ Ju Jitsu — 1. Kyu: Brown Belt"
  ["1Dan_Black"]="AAJJ Ju Jitsu — 1. Dan: Black Belt"
)

echo "Group: $GROUP"
echo "Output: $OUT_DIR"
echo ""

for pdf in "$OUT_DIR"/*.pdf; do
  stem="$(basename "$pdf" .pdf)"
  out_md="$OUT_DIR/${stem}.md"
  title="${TITLES[$stem]:-$stem}"

  echo "→ Extracting: $(basename "$pdf")"

  raw="$(pdftotext -layout -nopgbrk "$pdf" -)"

  {
    echo "# $title"
    echo "**Group:** $GROUP"
    echo ""
    echo "$raw" \
      | sed 's/\f//g'           \
      | sed 's/[[:space:]]*$//' \
      | sed '/^$/N;/^\n$/d'     \
      | sed 's/^   *//'
  } > "$out_md"

  echo "   ✓ Written: $(basename "$out_md") ($(wc -l < "$out_md") lines)"
done

echo ""
echo "Done! $(ls "$OUT_DIR"/*.md | wc -l) markdown files written to: $OUT_DIR"
