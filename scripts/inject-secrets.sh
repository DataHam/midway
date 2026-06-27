#!/bin/bash
# Inject Turnstile Sitekey from environment variable into HTML files
# This is called during the build process

SITEKEY=${TAMTHAM_TURNSTILE_SITEKEY:-"BUILD_TIME_SITEKEY"}

echo "Injecting Turnstile Sitekey into public/ HTML files..."

if [ "$SITEKEY" != "BUILD_TIME_SITEKEY" ]; then
  # Inject into the built files in the public directory
  if [ -d "public" ]; then
    sed -i "s/BUILD_TIME_SITEKEY/$SITEKEY/g" public/verify-danny.html
    sed -i "s/BUILD_TIME_SITEKEY/$SITEKEY/g" public/verify-helen.html
    echo "Sitekey injected successfully into public/ directory."
  else
    echo "Error: public/ directory not found. Sitekey not injected."
    exit 1
  fi
else
  echo "Warning: TAMTHAM_TURNSTILE_SITEKEY not set, skipping injection."
fi
