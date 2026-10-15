# Script to check Azure subscription and PostgreSQL status
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Checking Azure Subscription & Resources " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$accountJson = az account show --output json 2>$null
if (-not $accountJson) {
    Write-Host "[X] Not logged in to Azure. Run 'az login --use-device-code' first." -ForegroundColor Red
    exit 1
}

$account = $accountJson | ConvertFrom-Json
$stateColor = if ($account.state -eq "Enabled") { "Green" } else { "Red" }

Write-Host "Subscription Name : $($account.name)" -ForegroundColor Yellow
Write-Host "Subscription ID   : $($account.id)" -ForegroundColor Yellow
Write-Host "Tenant ID         : $($account.tenantId)" -ForegroundColor Yellow
Write-Host "User              : $($account.user.name)" -ForegroundColor Yellow
Write-Host "State             : $($account.state)" -ForegroundColor $stateColor

if ($account.state -ne "Enabled") {
    Write-Host ""
    Write-Host "[!] Your subscription state is '$($account.state)' (Read-Only)." -ForegroundColor Yellow
    Write-Host "To re-enable it:" -ForegroundColor Yellow
    Write-Host " 1. Open Azure Portal: https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade" -ForegroundColor White
    Write-Host " 2. Click on '$($account.name)'" -ForegroundColor White
    Write-Host " 3. Click 'Reactivate' or 'Upgrade to Pay-As-You-Go' and add a payment method." -ForegroundColor White
    Write-Host " 4. Once reactivated, re-run this script to verify." -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "[OK] Subscription is active and enabled for deployments!" -ForegroundColor Green

# Check Resource Group
$rg = az group show --name hostel --output json 2>$null
if ($rg) {
    $rgObj = $rg | ConvertFrom-Json
    Write-Host "[OK] Resource Group 'hostel' found in location: $($rgObj.location)" -ForegroundColor Green
} else {
    Write-Host "[!] Resource group 'hostel' not found. It will be created during deployment." -ForegroundColor Yellow
}

# Check dbhostel
$db = az postgres flexible-server show --resource-group hostel --name dbhostel --output json 2>$null
if ($db) {
    $dbObj = $db | ConvertFrom-Json
    $dbColor = if ($dbObj.state -eq "Ready") { "Green" } else { "Yellow" }
    Write-Host "[OK] PostgreSQL Server 'dbhostel' found. Status: $($dbObj.state)" -ForegroundColor $dbColor
} else {
    Write-Host "[!] PostgreSQL Server 'dbhostel' not found in resource group 'hostel'." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Ready for full deployment! Run .\deploy_azure.ps1" -ForegroundColor Cyan
