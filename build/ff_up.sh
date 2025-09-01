#!/bin/bash
set -e
HELP="Upload de firefox versie naar ldev.eu.org
Usage: ff_up.sh [--debug|-d] <key>"

cd $(dirname $0)

root="https://ldev.eu.org"
debug=false
while [[ $# -gt 1 ]] ; do
  case $1 in
    -d|--debug)
      debug=true
      shift
      ;;
    *)
      echo "$HELP"
      exit 1
      ;;
  esac
done

if $debug ; then
  echo "Debug mode"
  root="http://localhost:8080"
fi

key=$1
if [[ -z "$key" ]] ; then
  echo "$HELP"
  exit 1
fi

echo "Validating manifest"
pkg_id=$(cat ../manifest.json | jq -r .browser_specific_settings.gecko.id)
if [[ $(cat ../manifest.json | jq -r ".browser_specific_settings.gecko.update_url == \"https://ldev.eu.org/firefox/updates.json\"") == "false" ]] ; then
  printf 'validation failed\n' 1>&2
  exit 1
fi

echo "Deleting old artifacts..."
rm -rf web-ext-artifacts/*
echo "=== Building Extension ==="
python build.py
echo "=== Packing Extension ==="
web-ext build --source-dir smpp-build

ver=$(ls web-ext-artifacts | rg "smartschool_-([0-9]*.[0-9]*.[0-9]*).zip" -r '$1')

echo "=== Done ==="
echo "version: $ver"
echo "Uploading to $root..."
curl --data-binary @web-ext-artifacts/smartschool_-$ver.zip -H "Authorization:Bearer $key" "$root/firefox/$pkg_id?v=$ver"
