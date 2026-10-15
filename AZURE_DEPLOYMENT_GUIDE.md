# Azure Deployment Guide for SmartHostel (Frontend & Backend)

This guide documents the full deployment process for both the **FastAPI Backend** and the **Vite React Frontend** to Microsoft Azure.

---

## 1. Current Status & Pre-requisite

During the initial deployment attempt via Azure CLI, your account was authenticated:
- **Account**: `cb.sc.u4aie24147@cb.students.amrita.edu`
- **Subscription**: `Azure for Students` (`432244ee-8fad-4719-95f3-6505f09a7296`)
- **Current State**: **`Disabled` (Read-Only)**

> **Note**: Microsoft automatically marks Azure for Students subscriptions as *Disabled (Read-Only)* once the initial student credit expires. When disabled, Azure forbids any write operations (creating App Services, Static Web Apps, or starting flexible servers).

### How to Reactivate in the Azure Portal:
1. Open the [Azure Subscriptions Blade in the Portal](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade).
2. Select your subscription (**Azure for Students**).
3. Click the banner prompt to **Reactivate** or **Upgrade to Pay-As-You-Go** (you retain all free tier monthly allowances, such as Free Static Web Apps and Free/B1 App Service tiers).
4. Add your billing method and confirm.

---

## 2. Check Subscription Readiness

To check if your subscription has been re-enabled and resources are accessible:

Double-click:
```
check_azure.bat
```
Or run in PowerShell:
```powershell
.\check_azure_status.ps1
```
When it displays `[OK] Subscription is active and enabled for deployments!`, you are ready to deploy.

---

## 3. One-Click Automated Deployment

Once active, deploy both frontend and backend automatically:

Double-click:
```
deploy_azure.bat
```
Or run in PowerShell:
```powershell
.\deploy_azure.ps1
```

### What the Automated Script Does:
1. **Verifies Authentication & Subscription**: Ensures Azure CLI is authenticated and active.
2. **Prepares Resource Group**: Checks for resource group `hostel`.
3. **Connects & Starts PostgreSQL**: Starts the `dbhostel.postgres.database.azure.com` server and adds the firewall rule allowing internal Azure App Service connections.
4. **Provisions Backend App Service**: Creates a Linux App Service plan and Python 3.12 Web App configured with:
   - `DATABASE_URL` pointing to your Azure PostgreSQL instance.
   - `JWT_SECRET` for secure authentication.
   - `PORT=8000`
   - Startup command: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. **Packages & Deploys Backend**: Compresses `backend/` and deploys it directly to Azure App Service.
6. **Provisions & Deploys Frontend**: Creates an Azure Static Web App, builds the React frontend pointing to `https://<backend-app>.azurewebsites.net/api`, and uploads the production bundle.
7. **Configures CORS**: Automatically whitelists the frontend domain in backend CORS policies.

---

## 4. Deployed Endpoints

After the script finishes, your live project URLs will be displayed:
- **Frontend Live URL**: `https://<app-name>.azurestaticapps.net`
- **Backend API URL**: `https://<app-name>.azurewebsites.net`
- **Swagger Interactive API Docs**: `https://<app-name>.azurewebsites.net/docs`
