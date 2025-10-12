$ErrorActionPreference = "Stop"

$PRIMARY = "turkiye-risk-map.vercel.app"
$FALLBACK = "risk-map-tr.vercel.app"

Write-Host "== Linking project ==" -ForegroundColor Yellow
npx vercel link --yes | Out-Null

Write-Host "== Adding domain ==" -ForegroundColor Yellow
$domainResult = npx vercel domains add $PRIMARY 2>&1
if ($LASTEXITCODE -eq 0) {
  $DOMAIN = $PRIMARY
} else {
  npx vercel domains add $FALLBACK | Out-Null
  $DOMAIN = $FALLBACK
}
Write-Host "Using domain: $DOMAIN"

Write-Host "== Deploying (clean) ==" -ForegroundColor Yellow
$deployOutput = npx vercel deploy --prod --force --yes
$URL = ($deployOutput | Select-String -Pattern 'https://.*\.vercel\.app' | Select-Object -Last 1).Matches.Value
Write-Host "Deployed: $URL"

Write-Host "== Setting alias ==" -ForegroundColor Yellow
npx vercel alias set $URL $DOMAIN | Out-Null

Write-Host "✅ DONE" -ForegroundColor Green
Write-Host "Production URL : $URL"
Write-Host "Primary Domain : https://$DOMAIN"

