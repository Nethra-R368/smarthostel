# SmartHostel — Complete Render Cloud Deployment Guide

This document provides the authoritative, step-by-step production deployment guide for the **SmartHostel** management system on **Render Cloud**.

---

## 1. System Architecture

The deployed application follows a modern decoupled 3-tier cloud architecture:

```
[ User Browser ]
       │
       ▼  (HTTPS / Global Edge CDN)
[ Render Static Site: smarthostel-frontend ]  (React 19 + Vite SPA)
       │
       ▼  (REST API / JSON / Bearer JWT)
[ Render Web Service: smarthostel-api ]       (Python 3.12 FastAPI + Uvicorn)
       │
       ▼  (Internal Encrypted PostgreSQL Connection over Port 5432)
[ Render PostgreSQL: smarthostel-db ]         (PostgreSQL Engine with Triggers, Views & Procedures)
```

> **Note regarding Azure Database:**  
> A previous deployment was attempted using Microsoft Azure Database for PostgreSQL (`dbhostel.postgres.database.azure.com`). However, because the underlying *Azure for Students* subscription is currently marked `Disabled` (Read-Only) by Microsoft due to credit exhaustion, **Render PostgreSQL is the active, operational database for this deployment.** Historical Azure setup files (`AZURE_POSTGRES_SETUP.md` and `AZURE_DEPLOYMENT_GUIDE.md`) have been retained for reference.

---

## 2. Environment Variables Specification

Configure the following variables in the Render Dashboard (or via `render.yaml`):

### A. Backend Web Service (`smarthostel-api`)

| Variable Name | Required | Description | Example / Recommended Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Internal connection string to Render PostgreSQL | Automatically linked from `smarthostel-db` |
| `JWT_SECRET` | **Yes** | 256-bit cryptographically secure key for signing JWTs | Auto-generated or custom 64-char string |
| `PORT` | **Yes** | Web server listen port | `8000` (Render defaults to 10000 or assigned `$PORT`) |
| `ALLOWED_ORIGINS` | **Yes** | Comma-separated list of allowed frontend origins for CORS | `https://smarthostel-frontend.onrender.com` |

### B. Frontend Static Site (`smarthostel-frontend`)

| Variable Name | Required | Description | Example / Recommended Value |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Public HTTPS endpoint of your deployed FastAPI backend | `https://smarthostel-api.onrender.com/api` |
| `VITE_API_URL` | Optional | Fallback alias for backward compatibility | `https://smarthostel-api.onrender.com/api` |

---

## 3. Step-by-Step Render Deployment

### Method 1: Automated Blueprint Deployment (Recommended)

1. Open your browser and navigate to the Render Blueprint launcher:
   **[https://dashboard.render.com/deploy?repo=https://github.com/Nethra-R368/smarthostel](https://dashboard.render.com/deploy?repo=https://github.com/Nethra-R368/smarthostel)**
2. In the **Blueprint Name** field, enter:
   ```text
   smarthostel
   ```
3. Ensure **Branch** is set to `main` and **Blueprint Path** is `render.yaml`.
4. Click **Apply**.
5. Render will automatically provision:
   - **`smarthostel-db`** — Render PostgreSQL Database (Free tier)
   - **`smarthostel-api`** — Python Web Service running `uvicorn app.main:app`
   - **`smarthostel-frontend`** — React Vite Static Site

---

### Method 2: Manual Dashboard Creation

If you prefer provisioning each service individually via the Render web console:

#### Step 1: Create PostgreSQL Database
1. In the Render Dashboard, click **New +** ➔ **PostgreSQL**.
2. Configure:
   - **Name:** `smarthostel-db`
   - **Database Name:** `smarthostel`
   - **User:** `dbadmin`
   - **Region:** `Oregon (US West)` (or closest region)
   - **Instance Type:** `Free`
3. Click **Create Database**.
4. Once created, note two connection strings from the database dashboard:
   - **Internal Database URL:** (used by the backend web service)
   - **External Database URL:** (used for seeding from your local terminal)

#### Step 2: Create Backend Web Service
1. Click **New +** ➔ **Web Service**.
2. Connect your GitHub repository: `Nethra-R368/smarthostel`.
3. Configure settings:
   - **Name:** `smarthostel-api`
   - **Region:** Same region as your database (`Oregon`)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
4. Under **Environment Variables**, add:
   - `DATABASE_URL` = *(Paste Internal Database URL from Step 1)*
   - `JWT_SECRET` = *(Generate a random 64-char string)*
   - `ALLOWED_ORIGINS` = `*` (or your frontend domain once known)
5. Click **Create Web Service**.

#### Step 3: Create Frontend Static Site
1. Click **New +** ➔ **Static Site**.
2. Connect your GitHub repository: `Nethra-R368/smarthostel`.
3. Configure settings:
   - **Name:** `smarthostel-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://smarthostel-api.onrender.com/api`
5. Under **Redirects/Rewrites**, add an SPA fallback rewrite:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
6. Click **Create Static Site**.

---

## 4. Safe Database Initialization & Seeding

Render creates an empty database. Follow these steps to initialize the schema, stored procedures, triggers, and base data:

1. Copy the **External Database URL** from the `smarthostel-db` page in Render.
2. In your local terminal, run the seeder tool:
   ```powershell
   $env:DATABASE_URL="<paste-external-database-url>"
   python seed.py
   ```
   *(Note: The seeder script includes data-protection guardrails. If tables already exist, it will safely skip execution to prevent data loss unless `--force` is explicitly provided).*

3. Verify default test accounts:
   - **Admin:** `username: admin` | `password: admin123`
   - **Boys Warden:** `username: warden_boys` | `password: warden123`
   - **Girls Warden:** `username: warden_girls` | `password: warden123`
   - **Accountant:** `username: accountant` | `password: acct123`
   - **Student (Sahaana):** `username: sahaana` | `password: sahaana123`

---

## 5. Verification & Health Monitoring

1. **Backend Health Check:**
   Visit: `https://<your-backend-name>.onrender.com/health`
   Expected response:
   ```json
   {"status": "healthy"}
   ```

2. **Interactive Swagger Documentation:**
   Visit: `https://<your-backend-name>.onrender.com/docs`

3. **Frontend Application:**
   Visit: `https://<your-frontend-name>.onrender.com`
   Log in with any test user to confirm end-to-end functionality.
