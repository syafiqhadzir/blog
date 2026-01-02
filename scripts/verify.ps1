<#
.SYNOPSIS
    Verify local codebase against CI/CD standards.
    Simulates the GitHub Actions pipeline for fast-fail local dev.
#>

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n🚀 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

Write-Step "Starting Local CI Simulation..."

# 1. Dependency Check
Write-Step "Checking Dependencies..."
npm install
bundle install
Write-Success "Dependencies up to date."

# 2. Safety Audit
Write-Step "Running Security Audit..."
bundle audit check --update
Write-Success "Ruby security check passed."
npm audit --audit-level=moderate
Write-Success "Node security check completed."

# 3. Quality Suite (Sequential for stability on Windows)
Write-Step "Executing Quality Suite (Lint & Test)..."
$qualityChecks = @(
    @{ Name = "TypeCheck"; Command = "npm.cmd"; Args = "run", "typecheck" },
    @{ Name = "ESLint"; Command = "npm.cmd"; Args = "run", "lint:ts" },
    @{ Name = "MarkdownLint"; Command = "npm.cmd"; Args = "run", "lint:md" },
    @{ Name = "RuboCop"; Command = "bundle.bat"; Args = "exec", "rubocop", "--parallel" },
    @{ Name = "RSpec"; Command = "bundle.bat"; Args = "exec", "rspec", "spec/unit" }
)

foreach ($check in $qualityChecks) {
    Write-Host "Running $($check.Name)..." -ForegroundColor Gray
    $checkArgs = $check.Args
    & $check.Command @checkArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "$($check.Name) failed with exit code $LASTEXITCODE"
        exit 1
    }
}
Write-Success "Quality suite passed."
if ($failed) {
    Write-Error "Quality suite failed! Check job outputs."
    exit 1
}
Write-Success "Quality suite passed."

# 4. Build & Profile
Write-Step "Optimizing Assets (Images)..."
npm.cmd run optimize:img
Write-Success "Image optimization complete."

Write-Step "Building Jekyll Site..."
bundle exec jekyll build
Write-Success "Build successful."

Write-Step "Minifying HTML..."
npm.cmd run minify
Write-Success "Minification complete."

Write-Step "Profiling Build Size..."
$size = (Get-ChildItem -Path "_site" -Recurse | Measure-Object -Property Length -Sum).Sum
$sizeMb = [Math]::Round($size / 1MB, 2)
Write-Host "Total Build Size: $sizeMb MB" -ForegroundColor Yellow

if ($size -gt 12MB) {
    Write-Warning "Build exceeds 12MB threshold! Current size: $sizeMb MB"
}

# 5. Integration Checks
Write-Step "Running HTMLProofer..."
bundle exec rake test:integration
Write-Success "Integration checks passed."

Write-Step "Validating AMP..."
npm run test:amp
Write-Success "AMP validation passed."

Write-Host "`n🛡️ LOCAL CI VERIFICATION SUCCESSFUL 🛡️`n" -ForegroundColor Green
