OUTDIR="compressed"
# === Create output folder ===
mkdir -p $OUTDIR

# === Loop through all JPG files ===
for file in *.jpg ; do
  echo Procesing $file
  # === Convert and compress ===
  magick "$file" -resize "480x480>" -strip -interlace Plane -quality 70 "$OUTDIR/$file"
done

echo "Done! Optimized images saved in $OUTDIR"
