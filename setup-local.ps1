$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskNode = (Get-Command node -ErrorAction SilentlyContinue).Source
$taskBundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if (Test-Path -LiteralPath $taskBundledNode) { $taskNode = $taskBundledNode }
if (-not $taskNode) { throw 'Install Node.js 20 or newer to run the local preparation scripts.' }
if (-not (Test-Path -LiteralPath '.env')) {
  $taskBytes = New-Object byte[] 32
  $taskRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $taskRng.GetBytes($taskBytes) } finally { $taskRng.Dispose() }
  $taskKey = [System.BitConverter]::ToString($taskBytes).Replace('-', '').ToLowerInvariant()
  $taskTemplate = Get-Content -LiteralPath '.env.example' -Raw
  $taskTemplate = $taskTemplate -replace '(?m)^N8N_ENCRYPTION_KEY=\s*$', ('N8N_ENCRYPTION_KEY=' + $taskKey)
  Set-Content -LiteralPath '.env' -Value $taskTemplate -Encoding UTF8
  Write-Output 'Created private .env with a local n8n encryption key. Keep it out of Git.'
}
foreach ($taskScript in @('scripts/prepare-data.mjs','scripts/build-workflow.mjs','scripts/sample-summary.mjs')) {
  & $taskNode $taskScript
  if ($LASTEXITCODE -ne 0) { throw ('Preparation failed: ' + $taskScript) }
}
& $taskNode --test tests/royalty.test.mjs tests/workflow.test.mjs
if ($LASTEXITCODE -ne 0) { throw 'Tests failed.' }
Write-Output 'Local files are ready. Next: implement Bubble and import the JSON into n8n.'
Write-Output 'Optional local n8n: start Docker Desktop, then run docker compose up -d.'
