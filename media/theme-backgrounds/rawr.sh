OUTDIR="optimized"
# === Create output folder ===
mkdir -p $OUTDIR

# === Loop through all JPG files ===
for file in *.{jpg,jpeg} ; do
  echo Procesing $file
  # === Convert and compress ===
  magick "$file" -resize "2560x1440>" -strip -interlace Plane -quality 85 "$outdir/$file.jpg"
done

echo "Done! Optimized images saved in $OUTDIR"
