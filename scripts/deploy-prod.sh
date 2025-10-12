#!/usr/bin/env bash
set -e

PRIMARY="turkiye-risk-map.vercel.app"
FALLBACK="risk-map-tr.vercel.app"

echo "== Linking project (idempotent) =="
npx vercel link --yes || true

echo "== Adding domain =="
if npx vercel domains add "$PRIMARY" >/dev/null 2>&1; then
  DOMAIN="$PRIMARY"
else
  npx vercel domains add "$FALLBACK" >/dev/null 2>&1 || true
  DOMAIN="$FALLBACK"
fi
echo "Using domain: $DOMAIN"

echo "== Deploying (clean, no cache) =="
URL=$(npx vercel deploy --prod --force --yes | awk '/https:\/\/.*\.vercel\.app/{u=$0} END{print u}')
echo "Deployed: $URL"

echo "== Setting alias =="
npx vercel alias set "$URL" "$DOMAIN"

echo "✅ DONE"
echo "Production URL : $URL"
echo "Primary Domain : https://$DOMAIN"

