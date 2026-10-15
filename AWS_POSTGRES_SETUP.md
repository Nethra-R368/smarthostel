# AWS RDS PostgreSQL Setup Guide

Follow these steps to set up, configure, and seed your PostgreSQL database on AWS RDS instead of Azure.

---

## Step 1: Create the PostgreSQL Database Instance in AWS RDS

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/).
2. In the search bar at the top, type **RDS** and select it.
3. In the RDS dashboard, click the **Create database** button.
4. Configure the database settings on the creation page:
   * **Choose a database creation method**: Select **Standard create**.
   * **Engine options**: Select **PostgreSQL**.
   * **Engine Version**: Select **PostgreSQL 16.x** (e.g., `16.3` or any available stable 16 version).
   * **Templates**: Select **Free Tier**. This is important to stay within free tier limits (using a burstable DB instance class like `db.t3.micro` or `db.t4g.micro`).
   * **Settings**:
     * **DB instance identifier**: `smarthostel-db`
     * **Master username**: `dbadmin`
     * **Master password**: Enter a secure password (write it down or save it safely).
   * **Connectivity**:
     * **Compute resource**: Select **Don't connect to an EC2 compute resource**.
     * **Network type**: IPv4.
     * **Virtual private cloud (VPC)**: Select your **Default VPC**.
     * **Public access**: Select **Yes**. *(This is necessary so your local computer can connect to seed the database).*
     * **VPC security group**: Choose **Create new**, and name it `smarthostel-db-sg`.
     * **Database port**: Keep the default `5432`.
   * **Database authentication**: Select **Password authentication**.
   * **Additional configuration**:
     * Expand this section at the bottom.
     * **Initial database name**: Enter `smarthostel`. *(This ensures the database is pre-created within the instance).*
5. Click **Create database** at the bottom. The deployment will take a few minutes. Wait until the status changes from *Creating* to **Available**.

---

## Step 2: Configure Firewall & Networking Rules (Security Group)

To allow your computer (running the backend code and seeding scripts) to access the AWS RDS database:

1. In the RDS dashboard, click on your newly created DB instance (`smarthostel-db`).
2. Under the **Connectivity & security** tab, look at the **Security** section and click the link under **VPC security groups** (e.g., `smarthostel-db-sg`).
3. This opens the VPC Security Groups page. Select your security group check box, and at the bottom select the **Inbound rules** tab.
4. Click **Edit inbound rules**.
5. Click **Add rule**:
   * **Type**: Select **PostgreSQL** (Port range will automatically set to `5432`).
   * **Source**: Select **My IP**. AWS will automatically detect your current IP address (e.g., `x.x.x.x/32`).
   * **Description**: Write `SmartHostel Local Access`.
6. Click **Save rules**.

---

## Step 3: Update Database Configuration in Your Project

Once your database is created, you need to point your project configuration to the AWS RDS instance:

1. Go back to the AWS RDS console and click on your DB instance `smarthostel-db`.
2. Under the **Connectivity & security** tab, copy the **Endpoint** address. It will look like:
   `smarthostel-db.cxxxxxxxxx.us-east-1.rds.amazonaws.com`
3. In your project, open the `.env` file in the root folder, and also open the `.env` file inside the `backend` folder.
4. Update the `DATABASE_URL` environment variable to match the AWS RDS connection string structure:

   ```env
   DATABASE_URL=postgresql://dbadmin:<your_password>@<rds-endpoint>:5432/smarthostel?sslmode=require
   ```

   * Replace `<your_password>` with the password you chose in Step 1.
   * Replace `<rds-endpoint>` with the actual endpoint you copied in Step 3.2.
   * Note: The `?sslmode=require` query parameter at the end is recommended for secure encrypted database connections to AWS RDS.

---

## Step 4: Re-initialize and Seed the Database on AWS RDS

Now, activate your Python virtual environment and run the seeding script. This script will connect to the remote AWS RDS instance, drop any existing tables, create the database schemas, triggers, stored procedures, and load sample seed data.

1. Open your terminal (PowerShell or Command Prompt) in the project root directory.
2. Activate your virtual environment:
   ```powershell
   venv\Scripts\activate
   ```
3. Run the database seeder:
   ```powershell
   python seed.py
   ```
4. Verify the database state by running the tests:
   ```powershell
   python test_db.py
   ```
5. You can also start the backend and frontend servers as usual using the bat scripts:
   ```powershell
   start_backend.bat
   start_frontend.bat
   ```
