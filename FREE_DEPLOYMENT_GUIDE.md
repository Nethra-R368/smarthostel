# Free Cloud Deployment Guide (Render & Vercel)

This project is now 100% pre-configured with **Infrastructure-as-Code** (`render.yaml` and `frontend/vercel.json`) to deploy:
- **Database**: PostgreSQL (Free)
- **Backend API**: Python FastAPI (Free)
- **Frontend App**: Vite React (Free)

No credit card required.

---

## Step 1: Push Project to GitHub

1. Open [https://github.com/new](https://github.com/new) in your browser and create a new repository called `smarthostel` (public or private).
2. Copy your GitHub repository URL (e.g. `https://github.com/<your-username>/smarthostel.git`).
3. Open your terminal in this project directory and run:
   ```bash
   git remote add origin https://github.com/<your-username>/smarthostel.git
   git push -u origin main
   ```

---

## Step 2: 1-Click Deploy on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account.
2. In the top right, click **New +** and select **Blueprint**.
3. Select your `smarthostel` repository.
4. Render will detect the included `render.yaml` file and show:
   - `smarthostel-db` (PostgreSQL Database - Free)
   - `smarthostel-api` (FastAPI Web Service - Free)
   - `smarthostel-frontend` (React Static Web App - Free)
5. Click **Apply**.

Render will automatically provision all three services!

---

## Step 3: Seed the Database

Once the PostgreSQL database finishes provisioning on Render:
1. In your Render dashboard, click on **smarthostel-db** and copy the **External Database URL**.
2. Run the seeder script locally to populate the database tables and data:
   ```powershell
   $env:DATABASE_URL="<paste-external-database-url>"
   python seed.py
   ```
3. Your cloud database is now seeded with all stored procedures, triggers, views, and initial data!

---

## Optional: Frontend on Vercel

If you prefer hosting the React frontend on **Vercel** instead:
1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `smarthostel` repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://smarthostel-api.onrender.com/api`
6. Click **Deploy**.
