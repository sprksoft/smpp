#!/bin/bash
set -e
HELP="help: generates a zip of all source code because firefox wants it."

OUTFILE="smpp_code.zip"

if ! [[ -z "$1" ]] ; then
  echo "$HELP"
  exit 1
fi

cd $(dirname $0)
cd ..

zip -r $OUTFILE src
zip -r $OUTFILE extension
zip $OUTFILE package.json package-lock.json .prettierrc tsconfig.json BUILD.md
printf "@ BUILD.md\n@=README.md\n" | zipnote -w $OUTFILE # crazy way to rename BUILD.md to README.md

mv $OUTFILE build/smpp/smpp_code.zip

