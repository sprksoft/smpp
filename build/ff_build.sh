#!/bin/bash
set -e
HELP="Build the extension and source code zips for firefox"

OUTDIR="smpp"
OUTFILE="$OUTDIR/smpp.xpi"

cd $(dirname $0)

while [[ $# -gt 1 ]] ; do
  case $1 in
    *)
      echo "$HELP"
      exit 1
      ;;
  esac
done

echo "=== Building Extension ==="
python build.py

echo "=== Generating review zip ==="
./ff_gen_review_zip.sh
