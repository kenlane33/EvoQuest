#!/bin/bash
# Convert all .heic files in this folder to .png using macOS's built-in `sips`.
# Double-click this file in Finder to run it. The original .heic files are left in place.

set -e
cd "$(dirname "$0")"

shopt -s nullglob nocaseglob
heic_files=(*.heic)

if [ ${#heic_files[@]} -eq 0 ]; then
    echo "No .heic files found in $(pwd)"
    exit 0
fi

echo "Converting ${#heic_files[@]} HEIC file(s) to PNG in: $(pwd)"
echo

count=0
for f in "${heic_files[@]}"; do
    out="${f%.*}.png"
    if [ -f "$out" ]; then
        echo "  skip (already exists): $out"
        continue
    fi
    echo "  $f  ->  $out"
    sips -s format png "$f" --out "$out" >/dev/null
    count=$((count + 1))
done

echo
echo "Done. Converted $count file(s)."
echo "Press any key to close this window..."
read -n 1 -s
