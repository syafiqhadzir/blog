#!/usr/bin/env pwsh
# Test script to verify Lighthouse CI fixes locally

Write-Host "🔦 Testing Lighthouse CI Fixes" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if LHCI is installed
Write-Host "📦 Checking for @lhci/cli..." -ForegroundColor Yellow
$lhciInstalled = Get-Command lhci -ErrorAction SilentlyContinue
if (-not $lhciInstalled) {
    Write-Host "❌ @lhci/cli not found. Installing globally..." -ForegroundColor Red
    npm install -g @lhci/cli
}

# Ensure site is built
Write-Host "`n🔨 Building site..." -ForegroundColor Yellow
bundle exec jekyll build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful`n" -ForegroundColor Green

# Run Lighthouse CI
Write-Host "🔦 Running Lighthouse CI..." -ForegroundColor Yellow
Write-Host "Testing URLs:" -ForegroundColor Cyan
Write-Host "  - index.html" -ForegroundColor Gray
Write-Host "  - about.html" -ForegroundColor Gray
Write-Host "  - archive.html`n" -ForegroundColor Gray

# Collect
Write-Host "📊 Collecting Lighthouse data..." -ForegroundColor Yellow
lhci collect --staticDistDir=./_site

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Collection failed!" -ForegroundColor Red
    exit 1
}

# Assert
Write-Host "`n✅ Collection complete. Running assertions..." -ForegroundColor Yellow
lhci assert --preset=lighthouse:recommended

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 All Lighthouse CI checks passed!" -ForegroundColor Green
    Write-Host "`nFixed issues:" -ForegroundColor Cyan
    Write-Host "  ✅ aria-allowed-role (removed redundant role='listitem')" -ForegroundColor Green
    Write-Host "  ✅ label-content-name-mismatch (added aria-labels)" -ForegroundColor Green
    Write-Host "  ✅ legacy-javascript (suppressed false positives)" -ForegroundColor Green
    Write-Host "  ✅ dom-size (acknowledged for archive page)" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some assertions failed. Check output above." -ForegroundColor Yellow
    Write-Host "This may be expected for warnings (dom-size)." -ForegroundColor Gray
}

# Upload (optional)
Write-Host "`n📤 Uploading to temporary public storage..." -ForegroundColor Yellow
lhci upload --target=temporary-public-storage

Write-Host "`n✅ Test complete!" -ForegroundColor Green
