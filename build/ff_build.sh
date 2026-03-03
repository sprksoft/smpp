#!/bin/bash
set -e
HELP="Build the extension for firefox"

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
echo "=== Packing Extension ==="
cd $OUTDIR
zip -r smpp.xpi .

echo "=== Done ==="
echo "Result written at: $OUTFILE"
