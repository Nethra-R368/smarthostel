# Connecting, Seeding, Running, and Hosting on Azure

You have successfully created your Azure Database for PostgreSQL flexible server `dbhostel`. Below is the complete guide to connecting your project, seeding the database, running the application locally, and hosting it on Azure.

---

## 1. How to Connect to your Azure Database

### Step A: Configure the Azure Firewall Rules
By default, Azure blocks all external IP addresses from connecting to your database. You must whitelist your computer's IP address:
1. Go to the **Azure Portal** and select your PostgreSQL server resource (**dbhostel**).
2. On the left sidebar menu, under **Settings**, click on **Networking**.
3. Under **Firewall rules**, click **+ Add current client IP address** to whitelist your computer's current public IP.
4. Check the box for **Allow public access from any Azure service within Azure to this server**. *(This is required for when you host the backend on Azure App Service later).*
5. Click **Save** at the top or bottom of the page.

### Step B: Configure the Project Environment Variables
1. Open the `.env` file in the project root folder.
2. Replace or update the `DATABASE_URL` variable to point to your Azure instance:
   ```env
   DATABASE_URL=postgresql://dbadmin:<your_password>@dbhostel.postgres.database.azure.com:5432/smarthostel?sslmode=require
   ```
   * Replace `<your_password>` with the password you set during the database creation.
   * Make sure to save the file.
3. Open the `backend/.env` file and make the same change to the `DATABASE_URL` there.

---

## 2. How to Test and Verify if the Connection is Working

To check if the database connection from your local computer to the Azure PostgreSQL server is working:

1. Open your terminal in the project directory.
2. Activate your virtual environment:
   ```powershell
   venv\Scripts\activate
   ```
3. Run the verification script:
   ```powershell
   python test_azure_conn.py
   ```
* **Success**: The script will print `=== CONNECTION SUCCESSFUL! ===` and display your PostgreSQL database version.
* **Failure**: The script will automatically analyze the failure and tell you if it's a firewall (IP block) issue, a password issue, or a database name configuration issue.

---

## 3. How to Seed the Database

Once the connection is verified, you must create the tables, relationships, and populate the database with seed data:

1. In your activated virtual environment terminal, run:
   ```powershell
   python seed.py
   ```
2. The seeder script will automatically connect to your Azure server, check if the `smarthostel` database exists (creating it if it does not), compile all schemas, views, stored procedures, triggers, and insert the mock user/hostel/room/student data.
3. Test your database features by running the automated unit test suite:
   ```powershell
   python test_db.py
   ```

---

## 4. How to Run the Application Locally (Connecting to Azure)

Once the database is seeded, you can start the local development servers which will communicate directly with your database hosted on Azure:

1. To run the backend API server:
   * Double-click `start_backend.bat` or run in terminal:
     ```powershell
     start_backend.bat
     ```
2. To run the frontend user interface:
   * Double-click `start_frontend.bat` or run in terminal:
     ```powershell
     start_frontend.bat
     ```

---

## 5. How to Host Your Application on Azure

To deploy your backend and frontend live to Azure, follow these steps:

### A. Deploying the FastAPI Backend (App Service)
1. In the Azure Portal search bar, type **App Services** and select it.
2. Click **+ Create** -> **Web App**.
3. Configure the settings:
   * **Resource Group**: Use the same resource group as your database (`hostel`).
   * **Name**: Choose a unique name (e.g., `smarthostel-api`).
   * **Publish**: Code.
   * **Runtime stack**: **Python 3.12** (or the Python version matching your virtual environment).
   * **Operating System**: Linux (recommended for Python App Services).
   * **Region**: Select the same region as your database (`UAE North`).
   * **Pricing plan**: Choose a basic or free tier.
4. Click **Next: Database** and **Next: Deployment**.
5. Once created, go to the Web App resource page.
6. Under **Settings** -> **Configuration** (or **Environment variables** in the new layout):
   * Click **+ New application setting** and add:
     * `DATABASE_URL`: Set to your Azure Database connection string.
     * `JWT_SECRET`: Your production JWT secret key.
     * `PORT`: `8000`
   * Click **Save** at the top.
7. Deploy the code from your repository (e.g., via GitHub Actions, or using the VS Code Azure App Service extension).

### B. Deploying the Frontend (Static Web Apps)
Since the frontend consists of static assets, hosting it on Azure Static Web Apps is highly cost-effective and performs exceptionally fast:
1. In the Azure Portal search bar, type **Static Web Apps** and select it.
2. Click **+ Create**.
3. Configure the settings:
   * **Resource Group**: `hostel`
   * **Name**: `smarthostel-app`
   * **Region**: Choose a close region.
   * **Deployment details**: Select GitHub, sign in, and select your repository and branch.
   * **Build Presets**: Choose **Custom** or **Vite** (depending on how the frontend is built).
     * **App location**: `/frontend` (path to the frontend folder)
     * **Api location**: Leave empty.
     * **Output location**: `dist` (or `build`, or `./` depending on your frontend setup).
4. Click **Review + Create**, then **Create**.
5. Once deployed, open the frontend settings in the portal to update the base URL of the API to point to your live backend endpoint (e.g., `https://smarthostel-api.azurewebsites.net`).
