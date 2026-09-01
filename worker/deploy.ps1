# Deploy the Pulse Oracle Worker straight through the Cloudflare API.
#
# We do not use `wrangler` here: its `workerd` postinstall cannot unpack inside
# the OneDrive-synced project folder (EBUSY on Windows). This does the same job
# with two API calls and no local dependency beyond esbuild, which the app
# already ships.
#
#   Prereqs:  $env:CLOUDFLARE_API_TOKEN  and  worker/.dev.vars (OPENROUTER_API_KEY=...)
#   Usage:    powershell -File worker/deploy.ps1

$ErrorActionPreference = 'Stop'

# Account id is not a credential, but this repo is public — keep it out of the source.
$AccountId = if ($env:CLOUDFLARE_ACCOUNT_ID) { $env:CLOUDFLARE_ACCOUNT_ID } else { '12cab0ba960531ce4900ccb5ef791739' }
$ScriptName = 'nucleus-pulse-signal'
$AllowedOrigins = 'https://rivohenfri.github.io,http://localhost:3001,http://127.0.0.1:3001'

$root = Split-Path -Parent $PSScriptRoot     # nucleus-pulse/
$worker = $PSScriptRoot                      # nucleus-pulse/worker/

if (-not $env:CLOUDFLARE_API_TOKEN) { throw 'CLOUDFLARE_API_TOKEN is not set.' }

# --- 1. Read the OpenRouter key (never committed; lives in worker/.dev.vars) ---
$devVars = Join-Path $worker '.dev.vars'
if (-not (Test-Path $devVars)) { throw "Missing $devVars" }
$key = (Get-Content $devVars | Where-Object { $_ -match '^OPENROUTER_API_KEY=' }) -replace '^OPENROUTER_API_KEY=', ''
if (-not $key) { throw 'OPENROUTER_API_KEY not found in .dev.vars' }

# --- 2. Bundle TypeScript -> a single ES module ---
$esbuild = Join-Path $root 'node_modules\.bin\esbuild.cmd'
if (-not (Test-Path $esbuild)) { throw "esbuild not found. Run npm install in $root first." }
$outFile = Join-Path $worker 'dist\index.mjs'
& $esbuild (Join-Path $worker 'src\index.ts') --bundle --format=esm --target=es2022 "--outfile=$outFile"
if ($LASTEXITCODE -ne 0) { throw 'esbuild failed' }

# --- 3. Upload script + bindings (the key goes up as an encrypted secret) ---
# curl.exe handles the multipart upload; Invoke-RestMethod mangles it.
$metaPath = Join-Path $env:TEMP 'nucleus-pulse-signal-meta.json'
@{
  main_module        = 'index.mjs'
  compatibility_date = '2026-09-01'
  bindings           = @(
    @{ type = 'secret_text'; name = 'OPENROUTER_API_KEY'; text = $key },
    @{ type = 'plain_text';  name = 'ALLOWED_ORIGINS';    text = $AllowedOrigins }
  )
} | ConvertTo-Json -Depth 5 | ForEach-Object {
  # UTF-8 WITHOUT a BOM — Cloudflare rejects the leading BOM bytes as invalid JSON.
  [System.IO.File]::WriteAllText($metaPath, $_, (New-Object System.Text.UTF8Encoding $false))
}

try {
  $url = "https://api.cloudflare.com/client/v4/accounts/$AccountId/workers/scripts/$ScriptName"
  $response = & curl.exe -s -X PUT $url `
    -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
    -F "metadata=@$metaPath;type=application/json" `
    -F "index.mjs=@$outFile;type=application/javascript+module"
} finally {
  Remove-Item $metaPath -Force -ErrorAction SilentlyContinue
}

$result = $response | ConvertFrom-Json
if ($result.success) {
  Write-Host "Deployed $ScriptName -> https://nucleus-pulse-signal.rivohenfri.cloud"
  Write-Host "  deployment: $($result.result.deployment_id)"
} else {
  Write-Host 'Deploy failed:'
  Write-Host $response
  exit 1
}
