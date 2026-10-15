import os
import sys
import psycopg2
from dotenv import load_dotenv

def test_connection():
    # Load environment variables from .env
    load_dotenv()
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL is not set in your .env file.")
        print("Please open your .env file and set it like this:")
        print("DATABASE_URL=postgresql://dbadmin:<your_password>@dbhostel.postgres.database.azure.com:5432/smarthostel?sslmode=require")
        sys.exit(1)
        
    print(f"Attempting to connect to database using URL from .env...")
    # Hide password in stdout for safety
    safe_url = db_url
    if "@" in db_url:
        parts = db_url.split("@")
        cred_parts = parts[0].split(":")
        if len(cred_parts) > 2:
            safe_url = f"{cred_parts[0]}:{cred_parts[1]}:****@{parts[1]}"
            
    print(f"Connection URL (masked): {safe_url}")
    
    try:
        conn = psycopg2.connect(db_url, connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print("\n=== CONNECTION SUCCESSFUL! ===")
        print(f"Connected to: {db_version[0]}")
        
        cursor.execute("SELECT current_database();")
        current_db = cursor.fetchone()
        print(f"Current Database: {current_db[0]}")
        
        # Check if tables exist
        cursor.execute("""
            SELECT count(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        """)
        table_count = cursor.fetchone()[0]
        print(f"Number of tables in 'public' schema: {table_count}")
        
        cursor.close()
        conn.close()
        
        if table_count == 0:
            print("\nThe database is connected but empty. You should run the seeder script now:")
            print("  python seed.py")
        else:
            print("\nThe database is successfully initialized and seeded!")
            
    except psycopg2.OperationalError as e:
        print("\n=== CONNECTION FAILED! ===")
        err_msg = str(e).strip()
        print(f"Error Details: {err_msg}")
        print("\nTroubleshooting Steps:")
        if "timeout" in err_msg.lower() or "could not connect" in err_msg.lower():
            print("1. FIREWALL RULE: Check if your local computer's IP address is added to the Azure PostgreSQL Firewall rules.")
            print("   - Go to your Azure Database for PostgreSQL flexible server page in the portal.")
            print("   - Under 'Networking' on the left menu, ensure your Client IP address is added.")
            print("   - Ensure 'Allow public access from any Azure service within Azure to this server' is checked.")
        elif "password authentication failed" in err_msg.lower():
            print("1. PASSWORD: Check if the password you put in the DATABASE_URL is correct.")
            print("2. USERNAME: Make sure the administrator login username is correct (e.g., dbadmin).")
        elif "database" in err_msg.lower() and "does not exist" in err_msg.lower():
            print("1. DATABASE NAME: The database name in your DATABASE_URL (e.g. '/smarthostel') doesn't exist yet.")
            print("   You can run `python seed.py` which will automatically connect to 'postgres' and create it for you.")
        else:
            print("1. Double-check that your DATABASE_URL format is correct in .env.")
            print("2. Ensure you have an active internet connection.")

if __name__ == "__main__":
    test_connection()
