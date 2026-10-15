param(
    [string]$ResourceGroup = "hostel",
    [string]$Location = "uaenorth",
    [string]$FrontendLocation = "eastasia",
    [string]$AppServiceName = "",
    [string]$StaticWebAppName = ""
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     SmartHostel - Azure Automated Full Deployment      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Azure Login and Subscription State
Write-Host "[1/7] Verifying Azure Authentication and Subscription..." -ForegroundColor Yellow
$accountJson = az account show --output json 2>$null
if (-not $accountJson) {
    Write-Host "[X] Not logged in to Azure CLI. Run 'az login --use-device-code' first." -ForegroundColor Red
    exit 1
}

$account = $accountJson | ConvertFrom-Json
$subColor = if ($account.state -eq "Enabled") { "Green" } else { "Red" }
Write-Host "  -> Subscription : $($account.name) ($($account.id))" -ForegroundColor Gray
Write-Host "  -> State        : $($account.state)" -ForegroundColor $subColor

if ($account.state -ne "Enabled") {
    Write-Host ""
    Write-Host "[ERROR] Subscription is '$($account.state)'. Azure blocks deployments on disabled subscriptions." -ForegroundColor Red
    Write-Host "Please reactivate or upgrade your subscription in the Azure Portal first." -ForegroundColor Yellow
    Write-Host "Visit: https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade" -ForegroundColor White
    exit 1
}

# 2. Check or Create Resource Group
Write-Host ""
Write-Host "[2/7] Checking Resource Group '$ResourceGroup'..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -ne "true") {
    Write-Host "  -> Creating resource group '$ResourceGroup' in '$Location'..." -ForegroundColor Gray
    az group create --name $ResourceGroup --location $Location | Out-Null
}
Write-Host "  [OK] Resource Group '$ResourceGroup' is ready." -ForegroundColor Green

# 3. Check PostgreSQL Flexible Server
Write-Host ""
Write-Host "[3/7] Checking Azure PostgreSQL Flexible Server 'dbhostel'..." -ForegroundColor Yellow
$dbJson = az postgres flexible-server show --resource-group $ResourceGroup --name dbhostel --output json 2>$null
if ($dbJson) {
    $db = $dbJson | ConvertFrom-Json
    Write-Host "  -> Server 'dbhostel' found. Current status: $($db.state)" -ForegroundColor Gray
    if ($db.state -eq "Stopped" -or $db.state -eq "Disabled") {
        Write-Host "  -> Starting PostgreSQL server 'dbhostel'..." -ForegroundColor Yellow
        az postgres flexible-server start --resource-group $ResourceGroup --name dbhostel | Out-Null
    }
    Write-Host "  -> Ensuring Azure internal firewall access rule..." -ForegroundColor Gray
    az postgres flexible-server firewall-rule create `
        --resource-group $ResourceGroup `
        --name dbhostel `
        --rule-name AllowAllAzureServicesAndResourcesWithinAzureIps `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 0.0.0.0 2>$null | Out-Null
} else {
    Write-Host "  [!] Notice: 'dbhostel' server not detected. If your database name is different, update DATABASE_URL." -ForegroundColor Yellow
}

# 4. Generate Unique Names if not specified
$randomSuffix = (Get-Random -Minimum 1000 -Maximum 9999).ToString()
if (-not $AppServiceName) {
    $AppServiceName = "smarthostel-api-$randomSuffix"
}
if (-not $StaticWebAppName) {
    $StaticWebAppName = "smarthostel-web-$randomSuffix"
}

$planName = "smarthostel-plan"

# 5. Provision and Deploy Backend (FastAPI on Azure App Service)
Write-Host ""
Write-Host "[4/7] Setting up Azure App Service for FastAPI Backend..." -ForegroundColor Yellow
$planJson = az appservice plan show --name $planName --resource-group $ResourceGroup --output json 2>$null
if (-not $planJson) {
    Write-Host "  -> Creating Linux App Service Plan '$planName' (B1 SKU)..." -ForegroundColor Gray
    try {
        az appservice plan create --name $planName --resource-group $ResourceGroup --location $Location --is-linux --sku B1 | Out-Null
    } catch {
        Write-Host "  -> Location '$Location' unavailable for plan, using 'centralindia'..." -ForegroundColor Yellow
        az appservice plan create --name $planName --resource-group $ResourceGroup --location "centralindia" --is-linux --sku B1 | Out-Null
    }
}

$appJson = az webapp show --name $AppServiceName --resource-group $ResourceGroup --output json 2>$null
if (-not $appJson) {
    Write-Host "  -> Creating Web App '$AppServiceName' (Python 3.12 Linux)..." -ForegroundColor Gray
    az webapp create --name $AppServiceName --resource-group $ResourceGroup --plan $planName --runtime "PYTHON:3.12" | Out-Null
}

Write-Host "  -> Configuring Web App environment settings..." -ForegroundColor Gray
$dbUrl = if ($env:AZURE_DATABASE_URL) { $env:AZURE_DATABASE_URL } else { "postgresql://dbadmin:<your_password>@dbhostel.postgres.database.azure.com:5432/smarthostel?sslmode=require" }
$jwtSecret = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "supersecretkey_smarthostel_dbms_project_2026" }

az webapp config appsettings set --resource-group $ResourceGroup --name $AppServiceName --settings `
    "DATABASE_URL=$dbUrl" `
    "JWT_SECRET=$jwtSecret" `
    "PORT=8000" `
    "SCM_DO_BUILD_DURING_DEPLOYMENT=true" | Out-Null

Write-Host "  -> Configuring startup command for FastAPI..." -ForegroundColor Gray
az webapp config set --resource-group $ResourceGroup --name $AppServiceName `
    --startup-file "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" | Out-Null

Write-Host ""
Write-Host "[5/7] Packaging and Deploying FastAPI Backend Code..." -ForegroundColor Yellow
$backendZipPath = Join-Path $PSScriptRoot "backend_deploy.zip"
if (Test-Path $backendZipPath) { Remove-Item $backendZipPath -Force }

$backendDir = Join-Path $PSScriptRoot "backend"
Write-Host "  -> Creating deployment archive from $backendDir..." -ForegroundColor Gray
Compress-Archive -Path "$backendDir\*" -DestinationPath $backendZipPath -Force

Write-Host "  -> Deploying zip package to Azure App Service '$AppServiceName'..." -ForegroundColor Gray
az webapp deploy --resource-group $ResourceGroup --name $AppServiceName --src-path $backendZipPath --type zip | Out-Null

$backendUrl = "https://$AppServiceName.azurewebsites.net"
Write-Host "  [OK] Backend deployed successfully to: $backendUrl" -ForegroundColor Green

# 6. Provision Frontend (Azure Static Web App)
Write-Host ""
Write-Host "[6/7] Setting up Azure Static Web App for Frontend..." -ForegroundColor Yellow
$swaJson = az staticwebapp show --name $StaticWebAppName --resource-group $ResourceGroup --output json 2>$null
if (-not $swaJson) {
    Write-Host "  -> Creating Azure Static Web App '$StaticWebAppName'..." -ForegroundColor Gray
    az staticwebapp create --name $StaticWebAppName --resource-group $ResourceGroup --location $FrontendLocation --sku Free | Out-Null
}

$swaToken = az staticwebapp secrets list --name $StaticWebAppName --resource-group $ResourceGroup --query properties.apiKey -o tsv
$swaHost = az staticwebapp show --name $StaticWebAppName --resource-group $ResourceGroup --query defaultHostname -o tsv
$frontendUrl = "https://$swaHost"

Write-Host "  -> Building React Vite Frontend pointing to $backendUrl/api..." -ForegroundColor Gray
$frontendDir = Join-Path $PSScriptRoot "frontend"
Push-Location $frontendDir
$env:VITE_API_URL = "$backendUrl/api"
npm run build
Pop-Location

Write-Host "  -> Uploading build artifacts to Static Web App..." -ForegroundColor Gray
$distDir = Join-Path $frontendDir "dist"
npx -y @azure/static-web-apps-cli deploy $distDir --deployment-token $swaToken --env production

Write-Host "  [OK] Frontend deployed successfully to: $frontendUrl" -ForegroundColor Green

# 7. Configure CORS on Backend Web App
Write-Host ""
Write-Host "[7/7] Whitelisting Frontend Domain in Backend CORS..." -ForegroundColor Yellow
az webapp cors add --resource-group $ResourceGroup --name $AppServiceName --allowed-origins $frontendUrl | Out-Null

if (Test-Path $backendZipPath) { Remove-Item $backendZipPath -Force }

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "            DEPLOYMENT COMPLETED SUCCESSFULLY!          " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Frontend Live URL : $frontendUrl" -ForegroundColor Cyan
Write-Host "Backend API URL   : $backendUrl" -ForegroundColor Cyan
Write-Host "API Swagger Docs  : $backendUrl/docs" -ForegroundColor Cyan
Write-Host "Database Host     : dbhostel.postgres.database.azure.com" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
