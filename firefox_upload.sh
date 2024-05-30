#!/bin/bash
# Upload de firefox versie naar ldev.eu.org
# Usage: firefox_upload.sh <session_token> [-d|--debug]

TOKEN_GET_URL="https://ldev.eu.org/sestoken"

domain="https://ldev.eu.org"
if [ "$2" = "-d" ] | [ "$2" = "--debug" ] ; then
  domain="http://localhost:8080"
fi


ses_token=$1
if [[ -z "$ses_token" ]] ; then
  echo "Session token required"
  echo "Go to $TOKEN_GET_URL and copy the token here"
  xdg-open $TOKEN_GET_URL
  echo -n "token: "
  read ses_token
  if [[ -z "$ses_token" ]] ; then
    ses_token="$(wl-paste)"
  fi
fi


echo "Deleting old artifacts..."
rm -rf web-ext-artifacts/*
echo "Building..."
web-ext build

ver=$(ls web-ext-artifacts | rg "smartschool_-([0-9]*.[0-9]*.[0-9]*).zip" -r '$1')

echo "version: $ver"
echo "Uploading..."
curl --data-binary @web-ext-artifacts/smartschool_-$ver.zip -H "Cookie:session=$ses_token" "$domain/firefox/smpp?v=$ver"
