# Eski sitedeki (Hostinger) tüm görselleri orijinal kalitede public/images klasörüne indirir.
# Repo klasöründe terminal açıp çalıştırın:
#   powershell -ExecutionPolicy Bypass -File .\scripts\gorselleri-indir.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$dir = Join-Path $root "public\images"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$urls = Get-Content (Join-Path $PSScriptRoot "gorsel-listesi.txt") | Where-Object { $_.Trim() -ne "" }
$i = 0
foreach ($u in $urls) {
  $i++
  $name = Split-Path $u -Leaf
  $out = Join-Path $dir $name
  if (Test-Path $out) { continue }
  Write-Host "[$i/$($urls.Count)] $name"
  Invoke-WebRequest -Uri $u -OutFile $out -UseBasicParsing
}
Write-Host "Bitti: $($urls.Count) gorsel public\images klasorunde."
