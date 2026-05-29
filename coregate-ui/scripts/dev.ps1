# Fix ComSpec not expanded (%SystemRoot%...) — causes pnpm exit -4058 on Windows
$env:ComSpec = 'C:\Windows\System32\cmd.exe'
Set-Location (Split-Path $PSScriptRoot -Parent)
pnpm exec next dev @args
